const mongoose = require('mongoose');

const simpleStringType = {
  type: String,
  required: true,
  minlength: 1,
  trim: true
};

const coordsType = {
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
};

var HospitalData = mongoose.model('HospitalData', {
  coords: coordsType,
  radius: {
    type: Number,
    required: true
  },
  items: [{
    id: {
      type: String,
       required: true,
       minlength: 10,
       trim: true
    },
    name: {
      type: String,
       required: true,
       minlength: 2,
       trim: true
    },
    coords: coordsType,
    vicinity: simpleStringType,
    types: [simpleStringType]
  }],
});

module.exports = {HospitalData};