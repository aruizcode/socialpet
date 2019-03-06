'use strict';
const express = require('express');
const FollowController = require('../controllers/follow');
const api = express.Router();
const md_auth = require('../middleware/autenticated');



api.post('/follow', md_auth.ensureAuth, FollowController.SaveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page', md_auth.ensureAuth, FollowController.getFollowinUser);
api.get('/followed/:id?/:page', md_auth.ensureAuth, FollowController.getFollowdUser);
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);


module.exports=api;
