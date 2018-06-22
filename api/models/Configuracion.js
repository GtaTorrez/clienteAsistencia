/**
 * Configuracion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'configuracion',
  attributes: {

    id: {
      type: 'integer',
      required: true,
      autoIncrement: true,
      primaryKey: true,
      size: 11
    },
    servidorUrl: {
      type: 'string',
      required: false,
      size: 20,
      defaultsTo: null
    },
    puertoCom_1: {
      type: 'string',
      required: false,
      size: 20,
      defaultsTo: null
    },
    puertoCom_2: {
      type: 'string',
      required: false,
      size: 20,
      defaultsTo: null
    },
    puertoCom_2: {
      type: 'string',
      required: false,
      size: 20,
      defaultsTo: null
    }

  }

};

