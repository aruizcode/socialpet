'use strict';

const express = require('express');
const MessageController = require('../controllers/message');
const api = express.Router();
const md_auth = require('../middleware/autenticated');


const multipart = require('connect-multiparty');
let md_upload  = multipart({uploadDir : './uploads/users'});

api.get('/pruebaM', MessageController.prueba);
api.post('/save-message',md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?' , md_auth.ensureAuth,MessageController.getReceivedMessage);
api.get('/messages/:page?' , md_auth.ensureAuth,MessageController.getEmitedMessage);
api.get('/unviewed-messages' , md_auth.ensureAuth,MessageController.getUnviewedMessage);
api.get('/set-viewed-messages' , md_auth.ensureAuth,MessageController.setViewdMessage);

module.exports = api;
