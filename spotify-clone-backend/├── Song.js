// models/Song.js
const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  audioFile: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    trim: true
  }],
  plays: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', SongSchema);
