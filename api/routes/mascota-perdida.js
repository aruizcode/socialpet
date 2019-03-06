'use strict';

const express = require('express');
const MascotaPerdidaController = require('../controllers/mascota-perdida');
const api = express.Router();
const md_auth = require('../middleware/autenticated');

const multipart = require('connect-multiparty');
let md_upload  = multipart({uploadDir : './uploads/mascotas-perdidas'});

api.get('/get-mascotas/:page?', md_auth.ensureAuth,MascotaPerdidaController.getMascotasPerdidas);

api.post('/add-mascota-perdida', md_auth.ensureAuth,MascotaPerdidaController.addMascotaPerdida);

api.post('/upload-image-mascota-perdida/:id' ,[md_auth.ensureAuth,md_upload], MascotaPerdidaController.uploadImageMascota);

api.get('/get-image-mascota-perdida/:imageFile',MascotaPerdidaController.getImageMascotasPerdidas);

api.delete('/delete-mascota-perdida/:id', md_auth.ensureAuth,MascotaPerdidaController.DeleteMascotaPerdida);


module.exports = api;
