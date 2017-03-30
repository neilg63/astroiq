const mongoose = require('mongoose');
var  ObjectId= mongoose.Schema.ObjectId;

var EventType = mongoose.model('EventType', {
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
  public: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: 0
  },
  userId: {
    type: ObjectId,
    required: true
  }
});

module.exports = {EventType};