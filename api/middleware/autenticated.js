'use strict';
//pasara por aqui para comprobar si el token es autorizado para las funciones que el cliente solicita
const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta_red_social';

exports.ensureAuth= function(req,res,next){

    if (!req.headers.authorization) {

        return res.status(403).json({message:"La peticion no tiene la cabecera de autentificacion"});
    }

        let token = req.headers.authorization.replace(/['"]+/g, '');

    try {

        var payload = jwt.decode(token,secret);

        if (payload.exp <= moment().unix()) {

          return res.status(401).json({message:"El token ha expirado"});
        }
    } catch (e) {

          return res.status(404).json({message:"El token no es valido"});
    }

    req.user = payload;

    next();


}
