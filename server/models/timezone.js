const mongoose = require('mongoose');

const simpleStringType = {
  type: String,
  required: true,
  minlength: 1,
  trim: true
};

const numberType = {
  type: Number,
  required: true
};

const coordsType = {
  lat: numberType,
  lng: numberType
};

var Timezone = mongoose.model('Timezone', {
  coords_date: simpleStringType,
  countryCode: simpleStringType,
  zoneName: simpleStringType,
  abbreviation: simpleStringType,
  dst: simpleStringType,
  dstStart: numberType,
  dstEnd: numberType
});

module.exports = {Timezone};