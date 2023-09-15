// backend/models/college.js

const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: String,
  location: String,
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University' // Assuming you have a University model
  }
});

module.exports = mongoose.model('College', collegeSchema);
