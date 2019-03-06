'use strict';

const express = require('express');
const UserController = require('../controllers/user');
const md_auth = require('../middleware/autenticated');

const api = express.Router();

const multipart = require('connect-multiparty');
let md_upload  = multipart({uploadDir : './uploads/users'});



api.post('/register', UserController.saveUser);

api.post('/login', UserController.loginUser);

api.get('/user/:id' ,md_auth.ensureAuth, UserController.getUser);

api.get('/users/:page?' ,md_auth.ensureAuth, UserController.getUsers);

api.get('/counters/:id?' ,md_auth.ensureAuth, UserController.getCounters);

api.put('/update-user/:id' ,md_auth.ensureAuth, UserController.updateUser);

api.post('/upload-image-user/:id' ,[md_auth.ensureAuth , md_upload] , UserController.uploadImage);

api.get('/get-image-user/:imageFile?' ,UserController.getImageFile);

api.put('/update-nick/:id',md_auth.ensureAuth, UserController.updateNick );

api.put('/update-user-name/:id',md_auth.ensureAuth, UserController.updateUserName);

api.put('/update-email/:id',md_auth.ensureAuth,UserController.updateEmail);


module.exports = api;
