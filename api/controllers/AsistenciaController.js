
// var SerialPort = require('serialport');
// var rest = require('restler');
// var moment = require('moment')
// var baseidentificacion = ''
// var actualIdentificacion = '0'

// var async = require('async');
// var auxAlumno = {
//     identificacion: 0,
//     materno: 'materno',
//     paterno: 'paterno',
//     nombre: 'nombre',
//     curso: 'predeterminado',
//     turno: 'predeterminado',
//     img: "",
// }

// var express = require('express'),
//     app = express(),
//     http = require('http'),
//     socketIo = require('socket.io');
// var server = http.createServer(app);
// var io = socketIo.listen(server);

// server.listen(1338);
// console.log('Server Sockets: el puerto 1338');

// //  var socketIo = require('socket.io');

// // var io = socketIo.listen(sails.hooks.http.server);

// var port_1 = new SerialPort('COM9', {
//     baudRate: 57600
// });
// var port_2 = new SerialPort('COM7', {
//     baudRate: 57600
// });

// var horaActual = ''
// var maxHoraLlegada = 9;
// var minsLlegada = 0;
// var minHoraSalida = 12;
// var minsSalida = 0;
// var hoy = new Date();

// var auxiliar = [1, 2]

// io.on('connection', function (socket) {

//     port_1.on('data', function (data) {
//         var hoy = new Date()
//         baseidentificacion = '';
//         var auxBase = data.toString();

//         auxBase = auxBase.split("$");
//         baseidentificacion = auxAlumno[0]

//         sails.log("AUXBASE :::", baseidentificacion);
//         async.series([
//             marcarAsistencia,
//             sincrono
//         ], function (err, resultado) {
//             console.log('results', resultado)
//             console.log('baseindentificacion', + baseidentificacion);
//             var datoAsistencia = resultado[0]
//             socket.emit('message', datoAsistencia);
//         });

//     });
//     port_2.on('data', function (data) {
//         var hoy = new Date()
//         baseidentificacion = '';
//         var auxBase = data.toString();

//         auxBase = auxBase.split("$");
//         baseidentificacion = auxAlumno[0]

//         sails.log("AUXBASE :::", baseidentificacion);
//         async.series([
//             marcarAsistencia,
//             sincrono
//         ], function (err, resultado) {
//             console.log('results', resultado)
//             console.log('baseindentificacion', + baseidentificacion);
//             var datoAsistencia = resultado[0]
//             socket.emit('message', datoAsistencia);
//         });

//     });

// });

// var sw = 0;
// var idNube = 0;
function sincrono(callback) {
    sails.log('-------------------------------')
    callback(null, 'six');
}

function marcarAsistencia(callback) {
    var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate()
    horaActual = moment().format('LTS')   //07:46:55.000Z
    // console.log("moment hora : ",moment().hour())
    //     console.log('horaActual', hoy.getHours() + ' : ' + hoy.getMinutes())
    if (hoy.getHours() >= maxHoraLlegada && hoy.getMinutes() >= minsSalida && sw == 0) {
        actualIdentificacion = '0';
        sw = 1;
    }

    console.log('fecha', fecha)
    if (baseidentificacion != actualIdentificacion) {
        if (actualIdentificacion == '0') { sw == 1 }

        actualIdentificacion = baseidentificacion;
        // console.log('paso 1', actualIdentificacion)

        Persona.findOne({ identificacion: baseidentificacion }).exec((err, datoPersona) => {
            if (datoPersona == undefined) {
                auxAlumno.nombre = 'NO'
                auxAlumno.paterno = 'ENCONTRADO NINGUN'
                auxAlumno.materno = 'USUARIO CON ESTE CODIGO, registre porfavor'

                baseidentificacion = '';
                callback(null, auxAlumno);
                return auxAlumno;
            }

            // console.log('paso nueevo', baseidentificacion)
            var query = "SELECT p.nombre as paralelo, t.nombre as turno, g.nombre as grupo, tmpCurso.nombre , tmpCurso.paterno ,tmpCurso.materno,tmpCurso.img, tmpCurso.id as idAlumno ,tmpCurso.idCurso, tmpCurso.idPersona from paralelo p, turno t, grupo g , (SELECT c.idParalelo, c.idTurno,c.idGrupo, tmpInscribe.nombre, tmpInscribe.img, tmpInscribe.paterno,tmpInscribe.materno, tmpInscribe.idPersona, tmpInscribe.id, tmpInscribe.idCurso from curso c , (SELECT i.idCurso, tmpAlumno.nombre, tmpAlumno.paterno,tmpAlumno.materno, tmpAlumno.img, tmpAlumno.id, tmpAlumno.idPersona from inscribe i , (select p.nombre , p.paterno, p.materno , p.img, p.id as idPersona, a.id from persona p, alumno a where p.identificacion = ? and p.id = a.idPersona) tmpAlumno where i.idAlumno = tmpAlumno.id) tmpInscribe where c.id = tmpInscribe.idCurso)tmpCurso WHERE p.id = tmpCurso.idParalelo and t.id = tmpCurso.idTurno and g.id = tmpCurso.idGrupo"

            Persona.query(query, [actualIdentificacion], function (err, consulta) {
                if (err) { return res.serverError(err); }

                var resultado = {}

                console.log('paso nueevo', baseidentificacion)
                sails.log('consulta', consulta[0]);
                console.log('tamaño console length', consulta.length)
                if (consulta.length > 0) {
                    resultado = consulta[0]
                } else {

                    resultado = datoPersona
                    resultado.curso = 'No inscrito'
                    resultado.turno = 'No inscrito'
                    resultado.paralelo = 'No inscrito'
                    resultado.grupo = ''
                    sails.log('++++++++ ERROE EN CONSULTA +++++ devolviendo persona', resultado);
                }

                Asistencia.findOne({ idPersona: resultado.idPersona, fecha: fecha }).exec((err, datoAsistencia) => {
                    // console.log('fechaAsistencia', datoAsistencia)

                    if (datoAsistencia == null) {
                        console.log('paso 2 creando nuevo')
                        Asistencia.create(
                            {
                                fecha: fecha,
                                estado: 'asistió',
                                hora_llegada: horaActual,
                                hora_salida: horaActual,
                                idGestionAcademica: 1,
                                idPersona: resultado.idPersona
                            }

                        ).exec((err, datoAsistencia) => {
                            if (err) { return res.serverError(err); }

                            auxAlumno = {
                                identificacion: actualIdentificacion,
                                materno: resultado.materno,
                                paterno: resultado.paterno,
                                nombre: resultado.nombre,
                                curso: resultado.grupo + " " + resultado.paralelo,
                                turno: resultado.turno,
                                img: resultado.img
                            }

                            if (hoy.getHours() >= minHoraSalida && hoy.getMinutes() >= minsSalida) {

                                auxAlumno.hora_llegada = moment().format('LTS') + ' no marco entrada'
                                auxAlumno.hora_salida = moment().format('LTS')

                            } else {
                                auxAlumno.hora_llegada = moment().format('LTS')
                                auxAlumno.hora_salida = moment().format('LTS') + '(no registrado)'

                            }

                            var jsonData = {
                                fecha: datoAsistencia.fecha,
                                estado: datoAsistencia.estado,
                                hora_llegada: datoAsistencia.hora_llegada,
                                hora_salida: datoAsistencia.hora_salida,
                                idGestionAcademica: datoAsistencia.idGestionAcademica,
                                idPersona: datoAsistencia.idPersona

                            };

                            // rest.postJson('http://192.241.152.146:1337/asistencia', jsonData).on('complete', function (data, response) {
                            //     // handle response
                            //     idNube = data.id;
                            //     console.log('datos subidos a la nube', data)
                            // });
                            callback(null, auxAlumno);
                            console.log("nuevo", auxAlumno)
                            sails.log('A2')
                            return auxAlumno;

                        });
                    }

                    if (hoy.getHours() >= minHoraSalida && hoy.getMinutes() >= minsSalida && datoAsistencia != null) {
                        console.log('paso 4 actualizando salida')

                        Asistencia.update({ idPersona: resultado.idPersona, fecha: fecha },
                            {
                                hora_salida: horaActual
                            }).exec((err, datoAsistencia) => {
                                console.log('actualizado', datoAsistencia)

                                auxAlumno = {
                                    identificacion: actualIdentificacion,
                                    materno: resultado.materno,
                                    paterno: resultado.paterno,
                                    nombre: resultado.nombre,
                                    curso: resultado.grupo + " " + resultado.paralelo,
                                    turno: resultado.turno,
                                    img: resultado.img,
                                    hora_llegada: datoAsistencia[0].hora_llegada,
                                    hora_salida: datoAsistencia[0].hora_salida
                                }

                                // var jsonData = {
                                //   fecha: datoAsistencia[0].fecha,
                                //   estado: datoAsistencia[0].estado,
                                //   hora_llegada: datoAsistencia[0].hora_llegada,
                                //   hora_salida: datoAsistencia[0].hora_salida,
                                //   idGestionAcademica: datoAsistencia[0].idGestionAcademica,
                                //   idPersona: datoAsistencia[0].idPersona

                                // };

                                // console.log("jsonData", jsonData)
                                // var baseUrl = 'http://192.241.152.146:1337/asistencia?where={"idPersona":' + jsonData.idPersona + ',"fecha":' + '"' + fecha + '"' + '}'
                                // console.log('baseUrl', baseUrl)
                                // rest.get(baseUrl).on('complete', function (data) {
                                //     //console.log(data); // auto convert to object

                                //     console.log('**************ID**********', data[0].id)
                                //     var baseUrl = 'http://192.241.152.146:1337/asistencia/' + data[0].id
                                //     rest.putJson(baseUrl, jsonData).on('complete', function (data, response) {
                                //         console.log('Asistencia actualizada', data)
                                //     });

                                //     return res.send(auxAlumno);
                                // });
                                sails.log('A2')
                                callback(null, auxAlumno);
                                return auxAlumno;
                            })
                    }

                    else if (datoAsistencia != null) {
                        console.log('mostrando sin cambios')
                        auxAlumno = {
                            identificacion: actualIdentificacion,
                            materno: resultado.materno,
                            paterno: resultado.paterno,
                            nombre: resultado.nombre,
                            curso: resultado.grupo + " " + resultado.paralelo,
                            turno: resultado.turno,
                            img: resultado.img,
                            hora_llegada: datoAsistencia.hora_llegada,
                            hora_salida: moment().format('LTS') + ' (momentanea)'
                        }

                        sails.log('A2')
                        callback(null, auxAlumno);
                        return auxAlumno;
                    }

                })

            });

        })

    } else {
        console.log('actualIdentifiacion', actualIdentificacion);
        console.log('baseIdentificacion', baseidentificacion);

        console.log('repedito')
        callback(null, auxAlumno);
        return auxAlumno;
    }

}

module.exports = {

    mostrar: function (req, res) {

        var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate()
        horaActual = moment().format('LTS')   //07:46:55.000Z
        // console.log("moment hora : ",moment().hour())
        //     console.log('horaActual', hoy.getHours() + ' : ' + hoy.getMinutes())
        if (hoy.getHours() >= maxHoraLlegada && hoy.getMinutes() >= minsSalida && sw == 0) {
            actualIdentificacion = '0';
            sw = 1;
        }

        console.log('fecha', fecha)
        if (baseidentificacion != actualIdentificacion) {
            if (actualIdentificacion == '0') { sw == 1 }

            actualIdentificacion = baseidentificacion;
            console.log('paso 1', actualIdentificacion)

            Persona.findOne({ identificacion: baseidentificacion }).exec((err, datoPersona) => {

                console.log('paso nueevo', baseidentificacion)
                var query = "SELECT p.nombre as paralelo, t.nombre as turno, g.nombre as grupo, tmpCurso.nombre , tmpCurso.paterno ,tmpCurso.materno,tmpCurso.img, tmpCurso.id as idAlumno ,tmpCurso.idCurso, tmpCurso.idPersona from paralelo p, turno t, grupo g , (SELECT c.idParalelo, c.idTurno,c.idGrupo, tmpInscribe.nombre, tmpInscribe.img, tmpInscribe.paterno,tmpInscribe.materno, tmpInscribe.idPersona, tmpInscribe.id, tmpInscribe.idCurso from curso c , (SELECT i.idCurso, tmpAlumno.nombre, tmpAlumno.paterno,tmpAlumno.materno, tmpAlumno.img, tmpAlumno.id, tmpAlumno.idPersona from inscribe i , (select p.nombre , p.paterno, p.materno , p.img, p.id as idPersona, a.id from persona p, alumno a where p.identificacion = ? and p.id = a.idPersona) tmpAlumno where i.idAlumno = tmpAlumno.id) tmpInscribe where c.id = tmpInscribe.idCurso)tmpCurso WHERE p.id = tmpCurso.idParalelo and t.id = tmpCurso.idTurno and g.id = tmpCurso.idGrupo"

                Persona.query(query, [actualIdentificacion], function (err, consulta) {
                    if (err) { return res.serverError(err); }

                    var resultado = {}

                    console.log('paso nueevo', baseidentificacion)
                    console.log('tamaño console length', consulta.length)
                    if (consulta.length == 1) {
                        resultado = consulta[0]
                    } else {

                        resultado = datoPersona
                        resultado.curso = 'No inscrito'
                        resultado.turno = 'No inscrito'
                        resultado.paralelo = 'No inscrito'
                        resultado.grupo = ''
                        sails.log('++++++++ ERROE EN CONSULTA +++++ devolviendo persona', resultado);
                    }

                    Asistencia.findOne({ idPersona: resultado.idPersona, fecha: fecha }).exec((err, datoAsistencia) => {
                        console.log('fechaAsistencia', datoAsistencia)

                        if (datoAsistencia == null) {
                            console.log('paso 2 creando nuevo')
                            Asistencia.create(
                                {
                                    fecha: fecha,
                                    estado: 'asistió',
                                    hora_llegada: horaActual,
                                    hora_salida: horaActual,
                                    idGestionAcademica: 1,
                                    idPersona: resultado.idPersona
                                }

                            ).exec((err, datoAsistencia) => {
                                if (err) { return res.serverError(err); }

                                auxAlumno = {
                                    identificacion: actualIdentificacion,
                                    materno: resultado.materno,
                                    paterno: resultado.paterno,
                                    nombre: resultado.nombre,
                                    curso: resultado.grupo + " " + resultado.paralelo,
                                    turno: resultado.turno,
                                    img: resultado.img
                                }

                                if (hoy.getHours() >= minHoraSalida && hoy.getMinutes() >= minsSalida) {

                                    auxAlumno.hora_llegada = moment().format('LTS') + ' no marco entrada'
                                    auxAlumno.hora_salida = moment().format('LTS')

                                } else {
                                    auxAlumno.hora_llegada = moment().format('LTS')
                                    auxAlumno.hora_salida = moment().format('LTS') + '(no registrado)'

                                }

                                var jsonData = {
                                    fecha: datoAsistencia.fecha,
                                    estado: datoAsistencia.estado,
                                    hora_llegada: datoAsistencia.hora_llegada,
                                    hora_salida: datoAsistencia.hora_salida,
                                    idGestionAcademica: datoAsistencia.idGestionAcademica,
                                    idPersona: datoAsistencia.idPersona

                                };

                                // rest.postJson('http://192.241.152.146:1337/asistencia', jsonData).on('complete', function (data, response) {
                                //     // handle response
                                //     idNube = data.id;
                                //     console.log('datos subidos a la nube', data)
                                // });

                                console.log("nuevo", auxAlumno)
                                return res.send(auxAlumno);

                            });
                        }

                        if (hoy.getHours() >= minHoraSalida && hoy.getMinutes() >= minsSalida && datoAsistencia != null) {
                            console.log('paso 4 actualizando salida')

                            Asistencia.update({ idPersona: resultado.idPersona, fecha: fecha },
                                {
                                    hora_salida: horaActual
                                }).exec((err, datoAsistencia) => {
                                    console.log('actualizado', datoAsistencia)

                                    auxAlumno = {
                                        identificacion: actualIdentificacion,
                                        materno: resultado.materno,
                                        paterno: resultado.paterno,
                                        nombre: resultado.nombre,
                                        curso: resultado.grupo + " " + resultado.paralelo,
                                        turno: resultado.turno,
                                        img: resultado.img,
                                        hora_llegada: datoAsistencia[0].hora_llegada,
                                        hora_salida: datoAsistencia[0].hora_salida
                                    }

                                    var jsonData = {
                                        fecha: datoAsistencia[0].fecha,
                                        estado: datoAsistencia[0].estado,
                                        hora_llegada: datoAsistencia[0].hora_llegada,
                                        hora_salida: datoAsistencia[0].hora_salida,
                                        idGestionAcademica: datoAsistencia[0].idGestionAcademica,
                                        idPersona: datoAsistencia[0].idPersona

                                    };

                                    // console.log("jsonData", jsonData)
                                    // var baseUrl = 'http://192.241.152.146:1337/asistencia?where={"idPersona":' + jsonData.idPersona + ',"fecha":' + '"' + fecha + '"' + '}'
                                    // console.log('baseUrl', baseUrl)
                                    // rest.get(baseUrl).on('complete', function (data) {
                                    //     //console.log(data); // auto convert to object

                                    //     console.log('**************ID**********', data[0].id)
                                    //     var baseUrl = 'http://192.241.152.146:1337/asistencia/' + data[0].id
                                    //     rest.putJson(baseUrl, jsonData).on('complete', function (data, response) {
                                    //         console.log('Asistencia actualizada', data)
                                    //     });

                                    //     return res.send(auxAlumno);
                                    // });
                                    res.send(auxAlumno);
                                })
                        }

                        else if (datoAsistencia != null) {
                            console.log('mostrando sin cambios')
                            auxAlumno = {
                                identificacion: actualIdentificacion,
                                materno: resultado.materno,
                                paterno: resultado.paterno,
                                nombre: resultado.nombre,
                                curso: resultado.grupo + " " + resultado.paralelo,
                                turno: resultado.turno,
                                img: resultado.img,
                                hora_llegada: datoAsistencia.hora_llegada,
                                hora_salida: moment().format('LTS') + ' (momentanea)'
                            }

                            res.send(auxAlumno)
                        }

                    })

                    console.log('consulta', resultado)

                });

            })

        } else {
            console.log('actualIdentifiacion', actualIdentificacion);
            console.log('baseIdentificacion', baseidentificacion);

            console.log('repedito')
            res.send(auxAlumno)
        }

    },
    cambioHora: function (req, res) {

        minHoraSalida = parseInt((req.body.minHoraSalida).substring(0, 2))
        minsSalida = parseInt((req.body.minHoraSalida).substring(3, 5))
        actualIdentificacion = '0'
        console.log('minHoraSalida', minHoraSalida)
        console.log('minsSalida', minsSalida)
        res.json('ajuste horario cambiado')

    },

    historial: function (req, res) {

        var id = req.user.idPersona;
        Asistencia.find({ where: { idPersona: id }, sort: 'fecha ASC' }).exec((err, datoAsistencias) => {

            res.send(datoAsistencias)
        });
    },
    historial_alumno: function (req, res) {

        var id = req.param('id');
        Asistencia.find({ where: { idPersona: id }, sort: 'fecha ASC' }).exec((err, datoAsistencias) => {

            res.send(datoAsistencias)
        });
    }

};

