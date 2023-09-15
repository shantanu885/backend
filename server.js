// backend/server.js

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const passport = require('passport');
const session = require('express-session');
const initializePassport = require('./passport-config');
const { secretKey } = require('./config/config');

// Express Session Middleware
app.use(session({
  secret: secretKey,
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport and Session
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduPlatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('Error connecting to MongoDB:', error));

// Middleware for JSON parsing
app.use(express.json());

// Use the routes
app.use('/api', require('./routes/api'));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on port ${PORT}`);
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });



