// backend/models/project.js

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  university: String,
  college: String,
  content: String  // Add this field for project content
});

module.exports = mongoose.model('Project', projectSchema);
