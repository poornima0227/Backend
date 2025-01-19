const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signUpValidation, loginValidation } = require('../helpers/validation');


router.post('/register', signUpValidation, authController.register);
router.post('/login',loginValidation, authController.login);

module.exports = router;
