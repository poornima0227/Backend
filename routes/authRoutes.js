const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signUpValidation } = require('../helpers/validation');

// router.post('/login', authController.login);
router.post('/register', signUpValidation, authController.register);

module.exports = router;
