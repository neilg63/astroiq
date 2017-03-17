const mongoose = require('mongoose');
var  ObjectId= mongoose.Schema.ObjectId;

var UserGroup = mongoose.model('UserGroup', {
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

module.exports = {UserGroup};
