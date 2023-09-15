// backend/models/university.js

const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: String,
  location: String,
});

module.exports = mongoose.model('University', universitySchema);
