'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//middleware recibir peticiones en formato json
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

  next();
});
//rutas
const user_routes = require('./routes/user');
const follow_routes = require('./routes/follow');
const publication_routes = require('./routes/publication');
const message_routes = require('./routes/message');
const mascota_routes = require('./routes/mascota-perdida');
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api',message_routes);
app.use('/api',mascota_routes);

//exportar app
module.exports = app;
