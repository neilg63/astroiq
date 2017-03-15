const mongoose = require('mongoose');
var  ObjectId= mongoose.Schema.ObjectId;

var Group = mongoose.model('Group', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  parent: {
    type: ObjectId,
    required: false
  },
  userId: {
    type: ObjectId,
    required: true
  }
});

module.exports = {Group};
