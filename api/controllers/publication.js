'use strict';

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');

function pruebaPublication(req, res) {
  res.status(200).json({
    message: "hola desde publication js"
  });
}

function savePublication(req, res) {
  let params = req.body;

  if (!params.text) {
    return res.status(404).json({
    message: "debes enviar un texto!!"
  });
  }
  let publication = new Publication();
  publication.text = params.text;
  publication.file = null;
  publication.created_at = moment().unix();
  publication.date = moment().format('DD-MM-YYYY ' + 'hh:mm')
  publication.user = req.user.sub;

  publication.save((err, publicationStored) => {
    if (err) return res.status(500).json({
      message: "ha ocurrido un error al guardar la publication"
    });
    if (!publicationStored) return res.status(500).json({
      message: "error al guardar la publication"
    });
    return res.status(200).json({
      ok: true,
      publicationStored
    });
  });
}

function getPublications(req, res) {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  let itemsPerPage = 4;
  Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
    if (err) return res.status(500).json({
      message: "Error al devolver el seguimiento"
    });
    let follows_clean = [];
    follows.forEach((follow) => {
      follows_clean.push(follow.followed);
    });

    let userId = req.user.sub;

    User.findById(userId, (err, user) => {
      if (err) return res.status(500).json({
        message: "Error en la peticion"
      });
      if (!user) return res.status(500).json({
        message: "El usuario no existe"
      });
      follows_clean.push(req.user.sub);

      Publication.find({user: {"$in": follows_clean}
      }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
        if (err) return res.status(500).json({
          message: "Error al devolver publicaciones"
        });
        if (!publications) return res.status(500).json({
          message: "No hay publicaciones"
        });
        return res.status(200).json({
          total_items: total,
          page: page,
          pages: Math.ceil(total / itemsPerPage),
          itemsPerPage: itemsPerPage,
          publications,
        });
      });
    });
  });
}
function getPublicationsUser(req, res) {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  let itemsPerPage = 4;

      Publication.find({user: req.user.sub}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
        if (err) return res.status(500).json({
          message: "Error al devolver publicaciones"
        });
        if (!publications) return res.status(500).json({
          message: "No hay publicaciones"
        });
        return res.status(200).json({
          total_items: total,
          page: page,
          pages: Math.ceil(total / itemsPerPage),
          itemsPerPage: itemsPerPage,
          publications,
        });
      });
}


function getPublication(req, res) {
  let publicationId = req.params.id;
  Publication.findById(publicationId, (err, publication) => {
    if (err) return res.status(500).json({
      message: "Error devolver publicaciones"
    });
    if (!publication) return res.status(500).json({
      message: "No existe la publication"
    });
    res.status(200).json({
      publication
    });
  });
}

function deletePublication(req, res) {
  let publicationId = req.params.id;
  Publication.findOneAndRemove({'user': req.user.sub,'_id': publicationId}, (err, publicationRemoved) => {
    if (err) return res.status(500).send({
      message: 'Error al borrar publicación'
    });
    if (!publicationRemoved) return res.status(404).send({
      message: 'Error la publicacion no existe'
    });
    return res.status(200).send({
      message: 'Publicación eliminada correctamente'
    });
  });

}

function uploadImage(req, res) {
  let publicationId = req.params.id;
  if (req.files) {
    let file_path = req.files.image.path;
    let file_split = file_path.split("/");
    let file_name = file_split[2];
    let ext_split = file_name.split('\.');
    let file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
      /*busca que el usuario que esta logeado es propietario de la publicacion que queremos actualizar*/
  Publication.findOne({'user': req.user.sub,'_id': publicationId}).exec((err, publication) => {
    if (publication) {
      /*actualiza documento de base de datos publicacion*/
      Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publication_update) => {
        if (err) return res.status(500).json({message: "error en la peticion"});
        if (!publication_update) return res.status(404).json({message: "No se ha podido actualizar la publicacion"});
        return res.status(200).json({
          ok: true,
          publication_update
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

function RemoveFilesOfUpload(res, file_path, message) {
  fs.unlink(file_path, (err) => {
    return res.status(500).json({
      message: message
    });
  });
}

function getImageFile(req, res) {
  let image_file = req.params.imageFile;
  let path_file = "./uploads/publications/" + image_file;
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



module.exports = {
  pruebaPublication,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile,
  getPublicationsUser

}
