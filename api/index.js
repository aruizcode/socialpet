'use strict';
require('./config/config');
const mongoose = require('mongoose');
const app = require('./app');

mongoose.Promise = global.Promise;
//conexion a la bbdd
mongoose.connect(process.env.RUTA ,{useNewUrlParser: true})
        .then(() => {
          console.log("conexion establecida");
          //conexion al servidor
          app.listen(process.env.PORT , ()=> {
            console.log("conexion al servidor establecida en el puerto " + process.env.PORT);
          })
        })
        .catch(()=> {
          console.log("No se ha establecido conexion");
        });
