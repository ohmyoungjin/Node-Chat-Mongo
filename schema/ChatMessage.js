const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const ChatMessage = new Schema({
  roomCode: {
    type: Number,
    required: true // null 여부
  },
  sender: {
    type: String,
    required: true
  },
  test: {
    type: String,
    required: true
  }  
});
module.exports = mongoose.model('ChatMessage', ChatMessage);