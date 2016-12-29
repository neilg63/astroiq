const mongoose = require('mongoose');

var Geo = mongoose.model('Geo', {
  string: {
    type: String,
     required: true,
     minlength: 1,
     trim: true
  },
  address: {
    type: String,
     required: true,
     minlength: 1,
     trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  location_type: {
    type: String,
     required: true,
     minlength: 1,
     trim: true
  },
  address_components: [{
    long_name: {
      type: String,
       required: true,
       minlength: 1,
       trim: true
    },
    short_name: {
      type: String,
     required: false,
     trim: true
    },
    types: [{
      type: String,
       required: false,
       trim: true
    }]
  }],
});

module.exports = {Geo};