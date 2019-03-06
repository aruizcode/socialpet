'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let publicationSchema = Schema({
  text : String ,
  file : String,
  created_at : String,
  date: String,
  user : {type : Schema.ObjectId , ref :'User'}
});

module.exports = mongoose.model('Publication', publicationSchema);
