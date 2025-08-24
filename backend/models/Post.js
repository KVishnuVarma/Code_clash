const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  profilePicture: { type: String },
  views: { type: Number, default: 0 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['post', 'question', 'discussion'], default: 'post' },
  tags: [String],
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Likes must be an array'
    }
  },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    profilePicture: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Post', PostSchema);