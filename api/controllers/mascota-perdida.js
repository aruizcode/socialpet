'use strict';

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');
const Mascota_perdida = require('../models/Mascota-perdida');



function pruebaMascotaPerdida(req, res) {
  res.status(200).json({
    message: "hola desde mascota perdida js"
  });
}

function addMascotaPerdida(req,res){
  let params = req.body;
  //name, description, town,file,created_at,date,lat,lng,user
  if (!params.name || !params.description || !params.town || !params.lat || !params.lng) {
      return res.status(404).json({
      message: "Te falta informacion",
      });
  }else{
    let mascota_perdida = new Mascota_perdida();
    mascota_perdida.name = params.name;
    mascota_perdida.description = params.description;
    mascota_perdida.town = params.town;
    mascota_perdida.file = null;
    mascota_perdida.created_at = moment().unix();
    mascota_perdida.date = moment().format('DD-MM-YYYY ' + 'hh:mm');
    mascota_perdida.lat = params.lat;
    mascota_perdida.lng = params.lng;
    mascota_perdida.user = req.user.sub;

    mascota_perdida.save((err, MascotaPerdidaStored) => {
      if (err) return res.status(500).json({
        message: "ha ocurrido un error al guardar la nueva mascota perdida"
      });
      if (!MascotaPerdidaStored) return res.status(500).json({
        message: "error al guardar el aviso de mascota perdida"
      });
      return res.status(200).json({
        ok: true,
        MascotaPerdidaStored
      });
    });
  }
}


function uploadImageMascota(req, res) {
  let MascotaPerdidaId = req.params.id;
  if (req.files) {
    let file_path = req.files.image.path;
    let file_split = file_path.split("/");
    let file_name = file_split[2];
    let ext_split = file_name.split('\.');
    let file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
      /*busca que el usuario que esta logeado es propietario de la publicacion que queremos actualizar*/
  Mascota_perdida.findOne({'user': req.user.sub,'_id': MascotaPerdidaId}).exec((err, MascotaPerdida) => {
    if (MascotaPerdida) {
      /*actualiza documento de base de datos publicacion*/
      Mascota_perdida.findByIdAndUpdate(MascotaPerdidaId, {file: file_name}, {new: true}, (err, Mascota_Perdida_Update) => {
        if (err) return res.status(500).json({message: "error en la peticion"});
        if (!Mascota_Perdida_Update) return res.status(404).json({message: "No se ha podido actualizar la publicacion"});
        return res.status(200).json({
          ok: true,
          Mascota_Perdida_Update
        });
      });
        } else {
          return RemoveFilesOfUpload(res, file_path, 'No tienes permisos para actualizar esta actualizacion');
        }
      });
    } else {
      return RemoveFilesOfUpload(res, file_path, 'extension no valida');
    }
  } else {
    return res.status(400).json({
      message: "No se han subido archivos"
    });
  }
}

function getMascotasPerdidas(req,res){
  let identity_user_id = req.user.sub;
  let page = 1;
  if (req.params.page) {
    page=req.params.page;
  }
  let itemsPerPage =  6;
  Mascota_perdida.find().sort('-created_at').populate('user').paginate(page,itemsPerPage,(err,MascotasPerdidas,total)=>{
    if(err) return res.status(500).json({message:"error en la peticion"});
    if(!MascotasPerdidas) return res.status(404).json({message:"no hay ususarios disponibles"});
      return res.status(200).json({ok:true ,
        total_items: total,
        MascotasPerdidas,
        page,
        pages : Math.ceil(total/itemsPerPage)
      });
  });
}

function RemoveFilesOfUpload(res, file_path, message) {
  fs.unlink(file_path, (err) => {
    return res.status(500).json({
      message: message
    });
  });
}

function getImageMascotasPerdidas(req, res) {
  let image_file = req.params.imageFile;
  let path_file = "./uploads/mascotas-perdidas/" + image_file;
  fs.exists(path_file, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      return res.status(400).json({
        message: "No eiste la imagen"
      });
    }
  });
}

function DeleteMascotaPerdida(req, res) {
  let MascotaPerdidaId = req.params.id;
  Mascota_perdida.findOneAndRemove({'user': req.user.sub,'_id': MascotaPerdidaId}, (err, MascotaRemoved) => {
    if (err) return res.status(500).send({
      message: 'Error al borrar mascota'
    });
    if (!MascotaRemoved) return res.status(404).send({
      message: 'Error la mascota perdida no existe'
    });
    return res.status(200).send({
      message: 'Aviso mascota perdida  eliminada correctamente'
    });
  });

}



module.exports = {
  pruebaMascotaPerdida,
  addMascotaPerdida,
  getMascotasPerdidas,
  uploadImageMascota,
  getImageMascotasPerdidas,
  DeleteMascotaPerdida

}
