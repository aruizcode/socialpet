'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


let userSchema = Schema({
  name : {
    type : String,
    required : [true, 'El nombre es necesario']
  },
  surname : {
    type : String,
    required : [true, 'El apellido es necesario']
  },
  nick : {
    type: String,
    required : [true, 'El apodo es necesario']
  },
  email : {
    type: String,
    unique: true,
    required : [true, 'El email es necesario']
  },
  password : {
    type : String,
    required : [true, 'La contraseña es obligatoria']
  },
  role : {
    type : String,
    default : 'ROLE_USER'
  },
  image : {
    type : String,
    required: false
  }
});



userSchema.plugin(uniqueValidator , {message : '{PATH} debe de ser unico'});

module.exports = mongoose.model('User', userSchema);
