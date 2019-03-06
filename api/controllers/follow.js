'use strict';

const mongoosePaginate = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');

function SaveFollow(req,res){
  let follow = new Follow();
  let params = req.body;

  follow.user = req.user.sub; //usuario que sigue que esta logged
  follow.followed = params.followed ; //usuario seguido

  follow.save((err,followStored) =>{
    if(err) return res.status(500).json({message:"error al guardar el seguimiento"});
    if(!followStored) return res.status(404).json({message : "el seguimiento no se ha guardado"});
    return res.status(200).json({ok:true, followStored});
  });
}

function deleteFollow(req,res){
  let userId = req.user.sub;
  let followId = req.params.id;

  Follow.find({'user' : userId , 'followed' :followId }).remove(err => {
    if(err) return res.status(500).json({message:"error al dejar de seguir"});
    return res.status(200).json({ok:true,message : "Se ha dejado de seguir a esa persona"});
  });
}

function getFollowinUser(req,res){
  let userId = req.user.sub;

  if(req.params.id && req.params.page){
    userId = req.params.id;
  }

  let page = 1;

  if(req.params.page){
    page = req.params.page;
  }else{
    page = req.params.id;
  }

  let itemsPerPage = 6;

  Follow.find({user: userId}).populate({path : 'followed'}).paginate(page,itemsPerPage ,(err, follows,total)=>{
    if(err) return res.status(500).json({message:"error al mostrar usuarios de follow"});
    if(!follows) return res.status(404).json({message:"No estas siguiendo a nadie"});
    followUserIds(req.user.sub).then((value)=>{
      return res.status(200).json({
        ok:true,
        total,
        pages: Math.ceil(total/itemsPerPage),
        follows,
        users_following : value.following,
        users_follow_me : value.followed
      });
    });
  });
}
async function followUserIds(user_id){
  let following = await Follow.find({"user": user_id}).select({'_id': 0, '__uv': 0, 'user': 0}).exec().then((follows)=>{
    let follows_clean=[];
    follows.forEach((follow)=>{
      follows_clean.push(follow.followed);
    });
    return follows_clean;
  }).catch((err)=>{ return handleerror(err);

});
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
function getFollowdUser(req,res){
  let userId = req.user.sub;

  if(req.params.id && req.params.page){
    userId = req.params.id;
  }

  let page = 1;

  if(req.params.page){
    page = req.params.page;
  }else{
    page = req.params.id;
  }

  let itemsPerPage = 6;

  Follow.find({followed: userId}).populate('user').paginate(page,itemsPerPage ,(err, follows,total)=>{
    if(err) return res.status(500).json({message:"error en el servidor"});
    if(!follows) return res.status(404).json({message:"No te sigue ningun usuario"});
    followUserIds(req.user.sub).then((value)=>{
      return res.status(200).json({
        ok:true,
        total,pages: Math.ceil(total/itemsPerPage),
        follows,
        users_following : value.following,
        users_follow_me : value.followed
    });
  });
});
}
//devolver usuarios que sigo
function getMyFollows (req, res){
  let userId = req.user.sub;
  let find = Follow.find({user:userId});

  if(req.params.followed){
    find = Follow.find({followed:userId});
  }
  find.populate('user').exec((err,follows)=>{
    if(err) return res.status(500).json({message:"error en el servidor"});
    if(!follows) return res.status(404).json({message:"No te sigues usuario"});
    return res.status(200).json({ok:true,follows});

  });
}

module.exports = {
  SaveFollow,
  deleteFollow,
  getFollowinUser,
  getFollowdUser,
  getMyFollows
}
