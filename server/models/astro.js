const mongoose = require('mongoose');

var simpleStringType = {
  type: String,
   required: true,
   minlength: 1,
   trim: true
};

var simpleNumberType = {
  type: Number,
  required: true,
};

var optionalNumberType = {
  type: Number,
  required: false,
};

var planetType = {
  key: simpleStringType,
  lng: simpleNumberType,
  lat: simpleNumberType,
  spd: simpleNumberType,
  glng: optionalNumberType,
  glat: optionalNumberType,
  gspd: optionalNumberType,
};

var AstroSchema = new mongoose.Schema({
  cmd: simpleStringType,
  personId:  Schema.Types.ObjectId,
  chartType: simpleStringType,
  tags: [Schema.Types.ObjectId],
  datetime: {
     type: Date,
     required: true
  },
  dateinfo: {
    calendar: simpleStringType,
    zone: simpleStringType,
    gmtOffset: simpleNumberType
  },
  geo: {
    lat: simpleNumberType,
    lng: simpleNumberType,
    alt: simpleNumberType,
    address: simpleStringType
  },
  astro: {
    ascendant: simpleNumberType,
    mc: simpleNumberType,
    armc: simpleNumberType,
    vertex: simpleNumberType,
    ut: simpleNumberType,
    et: simpleNumberType,
    delta_t: simpleNumberType,
    epsilon_true: {
      lng: simpleNumberType,
      lat: optionalNumberType,
      spd: optionalNumberType
    },
    nutation: {
      lng: simpleNumberType,
      lat: simpleNumberType
    },
    mean_node: {
      lng: simpleNumberType,
      lat: simpleNumberType,
      spd: simpleNumberType
    },
    true_node: {
      lng: simpleNumberType,
      lat: simpleNumberType,
      spd: -simpleNumberType
    },
    mean_apogee: {
      lng: simpleNumberType,
      lat: simpleNumberType,
      spd: simpleNumberType
    },
  },
  ayanamsas: [{
    num: simpleNumberType,
    value: simpleNumberType
  }],
  houses: [
    {
      key: simpleStringType,
      values: [simpleNumberType]
    }
  ],
  bodies: [
    planetType
  ],
});

var Astro = mongoose.model('Astro', AstroSchema);

module.exports = {Astro};