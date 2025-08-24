const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }
});

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  room: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
  format: {
    bold: [{ start: Number, end: Number }],
    italic: [{ start: Number, end: Number }],
    code: [{ start: Number, end: Number }]
  },
  attachments: [{
    type: { type: String, enum: ['image', 'file'] },
    url: String,
    name: String,
    size: Number
  }],
  reactions: [ReactionSchema],
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    preview: String
  },
  isPinned: { type: Boolean, default: false },
  status: {
    delivered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    read: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  forwardedFrom: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    username: String
  }
});

const ChatMessageModel = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessageModel;
