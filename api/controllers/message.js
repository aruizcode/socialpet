'use strict';
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');
const Message = require('../models/message');


function prueba(req,res){
  res.json({message:"estamos en mensajeria"});
}
function saveMessage(req,res){
  let params = req.body;
  if(!params.text || !params.receiver)return res.status(400).json({message:"Tienes que enviar los datos necesarios"});
  let message = new Message();
  message.emitter = req.user.sub;
  message.receiver = params.receiver;
  message.text = params.text;
  message.created_at = moment().unix();
  message.viewed = false;
  message.save((err,Messagestored)=>{
    if(err)return res.status(500).json({message:"Error en la peticion"});
    if(!Messagestored)return res.status(404).json({message:"Error al enviar el mensaje"});
    return res.status(200).json({message:Messagestored});
  });
}
function getReceivedMessage(req,res){
  let userId = req.user.sub;
  let page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  let itemsPerPage = 4;
  Message.find({receiver: userId}).sort('-created_at').populate('emitter','name nick surname image _id').paginate(page,itemsPerPage ,(err, messages,total)=>{
    if(err)return res.status(500).json({message:"Error en la peticion"});
    if(!messages)return res.status(404).json({message:"No hay mensajes"});
    res.status(200).json({
      total,
      page:page,
      pages : Math.ceil(total/itemsPerPage),
      messages : messages
    });
  });
}
function getEmitedMessage(req,res){
  let userId = req.user.sub;
  let page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  let itemsPerPage = 4;
  Message.find({emitter: userId}).sort('-created_at').populate('emitter receiver','name nick surname image _id').paginate(page,itemsPerPage ,(err, messages,total)=>{
    if(err)return res.status(500).json({message:"Error en la peticion"});
    if(!messages)return res.status(404).json({message:"No hay mensajes"});
    res.status(200).json({
      total,
      page:page,
      pages : Math.ceil(total/itemsPerPage),
      messages : messages
    });
  });
}
function getUnviewedMessage(req,res){
  let userId = req.user.sub;
  Message.count({receiver:userId , viewed:'false'}).exec((err,count)=>{
    if(err)return res.status(500).json({message:"Error en la peticion"});
    if(!count)return res.status(404).json({message:"No hay mensajes"});
    return res.status(200).json({
      'unviewed' : count
    })
  });
}
function setViewdMessage(req,res){
  let userId = req.user.sub;
  Message.update({receiver:userId , viewed:'false'} ,{viewed : 'true'},{multi : 'true'},(err,messageUpdate)=>{
    if(err)return res.status(500).json({message:"Error en la peticion"});
    return res.status(200).json({
      messages:messageUpdate
    });
  });
}

module.exports = {
  prueba,
  saveMessage,
  getReceivedMessage,
  getEmitedMessage,
  getUnviewedMessage,
  setViewdMessage
}
