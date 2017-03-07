const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  userId: Schema.Types.ObjectId,
  groups: [Schema.Types.ObjectId],
  gender: {
    type: String,
    required: false,
  },
  dob: {
     type: Date,
     required: false
  },
  gmtOffset: {
    type: Number,
    required: false,
  }
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = {Person}
