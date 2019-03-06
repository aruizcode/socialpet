'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let MascotaPerdidaSchema = Schema({
  name : String,
  description : String,
  town : String,
  file : String,
  created_at : String,
  date: String,
  lat:Number,
  lng : Number,
  user : {type : Schema.ObjectId , ref :'User'}
});

module.exports = mongoose.model('MascotaPerdida', MascotaPerdidaSchema);
