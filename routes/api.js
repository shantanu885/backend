const express = require('express');
const router = express.Router();
const University = require('../models/university');
const College = require('../models/college');
const Project = require('../models/project');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const passport = require('passport');

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard', // Redirect after successful login
    failureRedirect: '/login', // Redirect after failed login
    failureFlash: true
  }));

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Define routes

// Get all universities
router.get('/universities', async (req, res) => {
  try {
    const universities = await University.find();
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all colleges
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new university
router.post('/universities', async (req, res) => {
  const university = new University({
    name: req.body.name,
    location: req.body.location
  });

  try {
    const newUniversity = await university.save();
    res.status(201).json(newUniversity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new college
router.post('/colleges', async (req, res) => {
  const college = new College({
    name: req.body.name,
    location: req.body.location
  });

  try {
    const newCollege = await college.save();
    res.status(201).json(newCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new project with text content or file upload
router.post('/projects', upload.single('file'), async (req, res) => {
  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    university: req.body.university,
    college: req.body.college,
    content: req.file ? req.file.path : req.body.content
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check for plagiarism
router.post('/checkPlagiarism', async (req, res) => {
  const submittedContent = req.body.content;

  try {
    const isPlagiarized = await checkForPlagiarism(submittedContent);
    res.json({ isPlagiarized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to check for plagiarism
async function checkForPlagiarism(submittedContent) {
  // Retrieve all projects from the database
  const projects = await Project.find({}, 'content');

  // Compare submitted content with existing projects
  for (const project of projects) {
    const similarity = compareStrings(submittedContent, project.content);
    if (similarity > 0.8) {
      return true;
    }
  }

  return false;
}

// Function to compare strings (basic approach)
function compareStrings(str1, str2) {
  const tokens1 = str1.split(/\s+/);
  const tokens2 = str2.split(/\s+/);

  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  return commonTokens.length / Math.max(tokens1.length, tokens2.length);
}

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Log in a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: 'Login successful!' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Set headers for file download
router.get('/projects/:projectId/content', async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);
    if (project) {
      if (project.content.startsWith('uploads')) {
        res.setHeader('Content-disposition', 'attachment; filename=project.pdf');
        res.setHeader('Content-type', 'application/pdf');
        res.sendFile(path.join(__dirname, project.content));
      } else {
        res.json({ content: project.content });
      }
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Render registration form
router.get('/register', (req, res) => {
    res.sendFile(__dirname + '/../views/register.html');
  });
  
  // Handle registration form submission
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username is already taken
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
  
      if (user) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
  
      // Create a new user
      const newUser = new User({ username, password });
  
      // Save the user to the database
      newUser.save((err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
  
        // Redirect to the login page after successful registration
        res.redirect('/login');
      });
    });
  });

module.exports = router;

