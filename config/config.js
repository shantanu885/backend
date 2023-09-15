// config/config.js

const crypto = require('crypto');

const secretKey = crypto.randomBytes(64).toString('hex');

module.exports = {
  secretKey
};

//const { secretKey } = require('./config/config');

// Use secretKey for session management or any other sensitive operations
