const mongoose = require('mongoose');
var  ObjectId= mongoose.Schema.ObjectId;
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
  userId: {
    type:ObjectId,
    required: false
  },
  public: {
    type: Boolean,
    default: false
  },
  groups: [ObjectId],
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
