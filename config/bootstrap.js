/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var SerialPort = require('serialport');
var rest = require('restler');
var moment = require('moment')
var baseidentificacion = ''
var actualIdentificacion = '0'
var fs = require('fs');

var async = require('async');
var auxAlumno = {
  identificacion: 0,
  materno: 'materno',
  paterno: 'paterno',
  nombre: 'nombre',
  curso: 'predeterminado',
  turno: 'predeterminado',
  img: "",
}
const fileUpload = require('express-fileupload');
var cors = require('cors')
var express = require('express'),
app = express(),
http = require('http'),
socketIo = require('socket.io');
app.use(cors());
app.use(express.static('./assets'));
app.use(fileUpload());

var server = http.createServer(app);
var io = socketIo.listen(server);

app.post('/upload',function(req,res){
  // console.log(req);
  if(!req.files)
    return res.status.send('No se los subieron archivos');
  let fondo = req.files.fondo;
  // console.log(fondo);
  fondo.mv('./assets/cliente/fondo/fondo.jpg', function(err) {
    if (err){
      console.log(err);
      return res.status(500).send(err);
    }
      
    res.send('{"fondo":"http://127.0.0.1:1340/cliente/fondo/fondo.jpg"}')
    res.end();
  });
})

app.get('/fondo',function(req,res){
  res.send('{"fondo":"http://127.0.0.1:1340/cliente/fondo/fondo.jpg"}');
})

app.get('/puertos',function(req,res){
  let portss;
  SerialPort.list(function (err, ports) {
    portss=ports;
    res.send(portss);
  });
})

server.listen(1338);
console.log('Server Sockets: el puerto 1338');

//  var socketIo = require('socket.io');

// var io = socketIo.listen(sails.hooks.http.server);

var port_1;
var port_2;

var horaActual = ''
var maxHoraLlegada = 9;
var minsLlegada = 0;
var minHoraSalida = 12;
var minsSalida = 0;
var hoy = new Date();

var auxiliar = [1, 2]

var IO;
var servidorURL = "";

function enviaQR(data, socket) {

  var hoy = new Date()
  baseidentificacion = '';
  var auxBase = data.toString();

  auxBase = auxBase.split("$");
  baseidentificacion = auxBase[0]

  var datos = {baseidentificacion : baseidentificacion}

  rest.postJson(servidorURL + '/asistencia/mostrar', datos).on('complete', function (data,response) {

    sails.log("AUXBASE :::", baseidentificacion);
    console.log('baseindentificacion', baseidentificacion);
    sails.log("alumno", data)
    socket.emit('message', data);
  });

}

console.log("BOOSTRAP 1")

module.exports.bootstrap = function (done) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  console.log("BOOSTRAP 2")

  var config = Configuracion.findOne(1).exec(function (err, datoConfig) {

    if (datoConfig != undefined) {
      console.log(datoConfig)
      servidorURL = datoConfig.servidorUrl

      port_1 = new SerialPort(datoConfig.puertoCom_1, {
        baudRate: 57600
      });
      port_2 = new SerialPort(datoConfig.puertoCom_2, {
        baudRate: 57600
      });

      IO = io.on('connection', function (socket) {

        sails.log("CONNECTION")

        port_1.on('data', function (data) {
          // var hoy = new Date()
          // baseidentificacion = '';
          // var auxBase = data.toString();

          // auxBase = auxBase.split("$");
          // baseidentificacion = auxBase[0]

          // sails.log("AUXBASE :::", baseidentificacion);

          // console.log('baseindentificacion', baseidentificacion);

          // socket.emit('message', baseidentificacion);
          enviaQR(data, socket)

        });
        port_2.on('data', function (data) {

          enviaQR(data, socket)
          //socket.emit('message', data.toString());
        });

      });
    }

    done();

  });

};