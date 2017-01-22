/*
timezone: {
gmtOffset: 1,
timeZoneId: "Europe/Rome",
dstOffset: 2
},

*/

const mongoose = require('mongoose');

const simpleStringType = {
  type: String,
  required: true,
  minlength: 1,
  trim: true
};

const simpleNumber = {
  type: Number,
  required: true
};


const coordsType = {
  lat: simpleNumber,
  lng: simpleNumber
};

var Geoname = mongoose.model('Geoname', {
  string: {
	  type: String,
	   required: true,
	   minlength: 5,
	   trim: true
	},
  bias: simpleStringType,
  num_available: simpleNumber,
  num: simpleNumber,
  names: [{
     timezone: {
      gmtOffset: simpleNumber,
      timeZoneId: simpleStringType,
      dstOffset: simpleNumber
    },
    asciiName: simpleStringType,
    score: simpleNumber,
    countryCode: simpleStringType,
    coords: coordsType,
    continentCode: simpleStringType,
    geonameId: simpleNumber,
    toponymName: simpleStringType,
    population: simpleNumber,
    name: simpleStringType,
    countryName: simpleStringType,
    adminName1: simpleStringType
  }],
});

module.exports = {Geoname};