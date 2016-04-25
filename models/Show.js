
var mongoose = require('mongoose');

var showSchema =  mongoose.Schema({
/*  _id : Number,
  tvmazeid:Number,
  name : String,
  type: String,
  language: String,

  genre : [String],
  overview : String,
  rating :Number,
  status : String,
  image:{
      medium: String,
      original: String
  },
  ratingCount: Number,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  lastupdated:Number,
  episodes: [{
    season: Number,
    episodeNumber: Number,
    episodeName: String,
    firstAired: Number,
    overview: String,
    image:{
      medium: String,
      original: String
    },
    airdate:String,
    airtime:String,
    airstamp:String,

  }]
*/showId : {type: Number, unique : true, required : true, dropDups: true ,index : true}, 
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  seasons : []
},{strict:false},{ autoIndex: false },{id : false})

var Show = mongoose.model('Show', showSchema);
  
module.exports = Show;