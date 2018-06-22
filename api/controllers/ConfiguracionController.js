/**
 * ConfiguracionController
 *
 * @description :: Server-side logic for managing configuracions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    configurarPuertos: function (req, res) {

        var configuracion = {

            puertoCom_1: req.param('puertoCom_1'),
            puertoCom_2: req.param('puertoCom_2'),
            puertoCom_3: req.param('puertoCom_3')

        }

        var puertoCOM = req.param('puertoCom');
        Configuracion.create().exec(function (err, datoConfig) {

        });
    },

    enlace: function (req, res) {

        var configuracion = req.query;
        

        Configuracion.update(1,configuracion).exec(function(err,datoConfiguracion){

            res.send(datoConfiguracion)
        }) 

    }

};

