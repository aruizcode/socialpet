'use strict';

const express = require('express');
const PublicationController = require('../controllers/publication');
const api = express.Router();
const md_auth = require('../middleware/autenticated');

const multipart = require('connect-multiparty');
let md_upload  = multipart({uploadDir : './uploads/publications'});

api.get('/prueba', md_auth.ensureAuth,PublicationController.pruebaPublication);

api.post('/save-publication', md_auth.ensureAuth, PublicationController.savePublication);

api.get('/publications/:page?',md_auth.ensureAuth,PublicationController.getPublications);

api.get('/publications-user/:id/:page?',md_auth.ensureAuth,PublicationController.getPublicationsUser);

api.get('/publication/:id',md_auth.ensureAuth,PublicationController.getPublication);

api.delete('/delete-publication/:id',md_auth.ensureAuth,PublicationController.deletePublication);

api.post('/upload-image-pub/:id',[md_auth.ensureAuth,md_upload],PublicationController.uploadImage);

api.get('/get-image-pub/:imageFile' ,PublicationController.getImageFile);

module.exports = api;
