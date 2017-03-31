const mongoose = require('mongoose');
const {Person} = require('./person');
const {Tag} = require('./tag');
var ObjectId= mongoose.Schema.ObjectId;

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

var optionalStringType = {
  type: String,
  required: false,
  trim: true,
  default: ""
};

var optionalNumberType = {
  type: Number,
  required: false,
};

var AspectType = {
  from: String,
  to: String,
  start: Number,
  end: Number
}

var planetType = {
  key: simpleStringType,
  lng: simpleNumberType,
  lat: simpleNumberType,
  spd: simpleNumberType,
  glng: optionalNumberType,
  glat: optionalNumberType,
  gspd: optionalNumberType,
};

var ChartSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: false
  },
  personId:  {
    type: ObjectId,
    ref: 'Person'
  },
  chartType: simpleStringType,
  eventType: {
    type: ObjectId,
    required: false
  },
  eventTitle: optionalStringType,
  notes: optionalStringType,
  tags: [{type:ObjectId,ref:'Tag'}],
  datetime: {
     type: Date,
     required: true
  },
  dateinfo: {
    zone: simpleStringType,
    gmtOffset: simpleNumberType
  },
  geo: {
    lat: simpleNumberType,
    lng: simpleNumberType,
    alt: simpleNumberType,
    address: simpleStringType
  },
  rodden: optionalStringType,
  ascendant: simpleNumberType,
  mc: simpleNumberType,
  armc: simpleNumberType,
  vertex: simpleNumberType,
  ut: simpleNumberType,
  et: simpleNumberType,
  delta_t: simpleNumberType,
  epsilon_true: simpleNumberType,
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
  aspects: {
    opposition: [AspectType],
    trine: [AspectType],
    square: [AspectType],
    sextile: [AspectType],
    inconjunction:[AspectType],
    proxim: [AspectType]
  }
});

var Chart = mongoose.model('Chart', ChartSchema);

module.exports = {Chart};