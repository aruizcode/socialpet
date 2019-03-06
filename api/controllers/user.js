'use strict';
const bcrypt =require('bcrypt-nodejs');
const mongoose_paginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Publication = require('../models/publication');
const Follow = require('../models/follow');

const jwt = require('../services/jwt');



//funcion para guardar usuario que nos llega por el body
function saveUser(req,res) {

  let params = req.body;
  let user = new User();
  //objeto donde guardaremos ese usuario nuevo
  //comprobamos que todos los usuario hayan sido enviados esto es  mejorable
  if (params.name && params.surname && params.nick && params.email && params.password) {
    //creamos la estrucctura del objeto y la rellenamos
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.password = params.password;
    user.role = 'ROLE_USER',
    user.image = null
    //contolar usuarios duplicado
    User.find({$or: [
      {email:user.email.toLowerCase()},
      {nick:user.nick.toLowerCase()}
    ]}).exec((err,users) => {
      if (err) return res.status(500).json({message:"error peticion de usuario"});
      if(users && users.length >= 1){

        for (var i = 0; i < users.length; i++) {

          if(users[i].email == params.email && users[i].nick == params.nick){
            return res.json({id: 1,message : "el email y el nick estan en uso"});
          }else if(users[i].nick == params.nick){
            return res.json({id: 2,message : "el nick esta en uso"});
          }else{
            return res.json({id: 3,message : "el email esta en uso"});
          }
        }
      }else{
        bcrypt.hash(params.password , null , null , (err, hash) => {
          user.password = hash ;
          user.save((err,userStored) => {
            if (err) return res.status(500).json({message:"error al guardar el usuario"});
            if(userStored){
              res.status(200).json({ id : true,message:"usuario guardado" , userStored})
            }else{
              if (err) return res.status(404).json({message:"error al guardar el usuario"});
            }

          });
        });
      }
    });
  }
}
function loginUser(req,res) {
  let params = req.body;
  let email = params.email;
  let password = params.password;
  User.findOne({email:email} , (err,user)=>{
    if (err) return res.status(500).json({message: "error en la peticion"});
    if(user){
      bcrypt.compare(password , user.password , (err,check) => {
        if (check) {
          if (params.gettoken) {
            return res.status(200).json({
                user,
                token:jwt.createToken(user)
            });
          } else {
            user.password = undefined;
            return res.status(200).json({user});
          }

        } else {
          return res.status(404).json({id:2, message:"La contraseña no es correcta"});
        }
      });
    }else{
      return res.status(404).json({id:1,message:"No se ha encontrado ningun usuario con ese email"});
    }
  });
}

function getUser(req,res){
  let userId = req.params.id;
  User.findById(userId,(err, user)=> {
    if(err) return res.status(500).json({message:"error en la peticion"});

    if (!user) return res.status(404).json({message:"no se ha encontrado ese usuario"});

    followThisUser(req.user.sub , userId).then((value) => {
      user.password = undefined;
      return res.status(200).json({
        user,
        followed : value.followed,
        following : value.following
      });
    });
  });
}
async function followThisUser(identity_user_id, user_id){
  try {
    var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
    .then((following) => {
      console.log(following);
      return following;
    })
    .catch((err)=>{
      return handleerror(err);
    });
    var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
    .then((followed) => {
      console.log(followed);
      return followed;
    })
    .catch((err)=>{
      return handleerror(err);
    });
    return {
      following: following,
      followed: followed
    }
  } catch(e){
    console.log(e);
  }
}

function getUsers(req,res){
  let identity_user_id = req.user.sub;
  let page = 1;
  if (req.params.page) {
    page=req.params.page;
  }
  let itemsPerPage =  8;
  User.find().sort('_id').paginate(page,itemsPerPage,(err,users,total)=>{
    if(err) return res.status(500).json({message:"error en la peticion"});
    if(!users) return res.status(404).json({message:"no hay ususarios disponibles"});
    followUserIds(identity_user_id).then((value)=>{
      return res.status(200).json({ok:true ,
        identity_user_id,
        users ,
        users_following : value.following,
        users_follow_me : value.followed,
        total ,
        pages : Math.ceil(total/itemsPerPage)
      });
    });
  })
}
async function followUserIds(user_id){
  let following = await Follow.find({"user": user_id}).select({'_id': 0, '__uv': 0, 'user': 0}).exec().then((follows)=>{
    let follows_clean=[];
    follows.forEach((follow)=>{
      follows_clean.push(follow.followed);
    });
    return follows_clean;
  }).catch((err)=>{ return handleerror(err); });
  let followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__uv': 0, 'followed': 0}).exec().then((follows)=>{
    let follows_clean=[];
    follows.forEach((follow)=>{
      follows_clean.push(follow.user);
    });
    return follows_clean;
  }).catch((err)=>{ return handleerror(err); });

  return {
    following,
    followed
  }
}
const getCounters = (req, res) => {
  let userId = req.user.sub;
  if(req.params.id){
    userId = req.params.id;
  }
  getCountAll(userId).then((value) => {
    return res.status(200).json({value});
  });
}
const getCountAll = async (user_id) => {
  try{
    // Lo hice de dos formas. "following" con callback de countDocuments y "followed" con una promesa
    let following = await Follow.countDocuments({"user": user_id},(err, result) => { return result });
    let followed = await Follow.countDocuments({"followed": user_id}).then(count => count);
    let publications = await Publication.countDocuments({"user": user_id}).then(count => count);

    return { following, followed ,publications}

  } catch(e){
    console.log(e);
  }
}
function updateUser(req,res){
  let user_id = req.params.id;
  let params = req.body;
  delete params.password;
  if(user_id != req.user.sub) return res.status(500).json({message:"No tienes permiso para actualizar los datos del usuario"});

  User.find({$or: [

    {email: params.email.toLowerCase()},
    {nick: params.nick.toLowerCase()}

  ]}).exec((err,users) => {
    if (err) return res.status(500).json({message:"error peticion de usuario"});
    if(users && users.length >= 1){
      for (var i = 0; i < users.length; i++) {
        if(users[i].email == params.email && users[i].nick == params.nick){
          return res.json({id: 1,message : "el email y el nick estan en uso"});
        }else if(users[i].nick == params.nick){
          return res.json({id: 2,message : "el nick esta en uso"});
        }else{
          return res.json({id: 3,message : "el email esta en uso"});
        }
      }
    }else{
      User.findByIdAndUpdate(user_id, params ,{new : true} ,(err,user_update) => {
        if(err) return res.status(500).json({message:"error en la peticion"});
        if(!user_update)return res.status(404).json({message:"No se ha podido actualizar el usuario"});
        if(user_update) res.status(200).json({id:true ,user_update});
      });
    }
  });
}
function updateNick(req,res){
  let user_id = req.params.id;
  let params = req.body;
  let nick = params.nick;
  if(user_id != req.user.sub) {
    return res.status(500).json({message:"No tienes permiso para actualizar los datos del usuario"});
  }else{
    User.findOne({nick:params.nick.toLowerCase()}).exec((err,respuesta)=>{
      if (err) return res.status(500).json({message:"error peticion de usuario"});
      if(respuesta){
        return res.json({message:"usuario en bbdd",error:1});
      }else{
        User.findByIdAndUpdate(user_id, params ,{new : true} ,(err,nick_update) => {
          if(err) return res.status(500).json({message:"error en la peticion"});
          if(!nick_update)return res.status(404).json({message:"No se ha podido actualizar el usuario"});
          if(nick_update) res.status(200).json({id:true ,nick_update});
        });
      }
    });
  }
}
function updateEmail(req,res){
  let user_id = req.params.id;
  let params = req.body;
  if(user_id != req.user.sub) {
    return res.status(500).json({message:"No tienes permiso para actualizar los datos del usuario"});
  }else{
    User.findOne({email:params.email}).exec((err,respuesta)=>{
      if (err) return res.status(500).json({message:"error peticion de usuario"});
      if(respuesta){
        return res.json({message:"usuario en bbdd",error:1});
      }else{
        User.findByIdAndUpdate(user_id, params ,{new : true} ,(err,email_update) => {
          if(err) return res.status(500).json({message:"error en la peticion"});
          if(!email_update)return res.status(404).json({message:"No se ha podido actualizar el usuario"});
          if(email_update) res.status(200).json({id:true ,email_update});
        });
      }
    });
  }
}

function updateUserName(req,res){
  let user_id = req.params.id;
  let params = req.body;
  if(user_id != req.user.sub){
    return res.status(500).json({message:"No tienes permiso para actualizar los datos del usuario"});
  }else{
    User.findByIdAndUpdate(user_id, params ,{new : true} ,(err,name_update) => {
      if(err) return res.status(500).json({message:"error en la peticion"});
      if(!name_update)return res.status(404).json({message:"No se ha podido actualizar el usuario"});
      if(name_update) res.status(200).json({id:true ,name_update});
    });
  }
}

function uploadImage(req, res) {
  var user_id = req.params.id;

  if(req.files){
    let file_path = req.files.image.path;
    let file_split = file_path.split("/");
    let file_name = file_split[2];
    let extension_split = file_name.split("\.");
    let file_extension = extension_split[1];

    if (user_id != req.user.sub){
      RemoveFilesOfUploads(res,file_path,"no tienes permisos para actualizar la imagen de usuario");
    }

    if(file_extension=="png" || file_extension=="jpg" || file_extension=="jpeg" || file_extension=="gif"){
      User.findByIdAndUpdate(user_id,{image:file_name},{new:true},(err,userUpdated)=>{
        if(err) return res.status(500).json({message:"error en la peticion"});
        if(!userUpdated)return res.status(404).json({message:"No se ha podido actualizar la imagen de usuario"});
        if(userUpdated) res.status(200).json({id:true ,userUpdated});
      });
    }else{
      RemoveFilesOfUploads(res,file_path,"extension no valida");
    }

  }else{
    return res.status(400).json({message:"no se han subido imagenes"});
  }
}
function RemoveFilesOfUploads(res,file_path,message){

  fs.unlink(file_path,(err) =>{
    return res.status(500).json({message:message});
  });

}
function getImageFile(req,res){
  let image_file = req.params.imageFile;
  let path_file = "./uploads/users/"+image_file;
  fs.exists(path_file,(exists)=>{
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      return res.status(200).json({message:"No eiste la imagen"});
    }
  });
}


module.exports = {
  saveUser,
  loginUser,
  getUser,
  getUsers,
  getCounters,
  updateUser,
  uploadImage,
  getImageFile,
  updateNick,
  updateUserName,
  updateEmail
}
