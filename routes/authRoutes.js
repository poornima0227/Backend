const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signUpValidation, loginValidation, updateProfileValidation ,handleValidationErrors} = require('../helpers/validation');


router.post('/register', signUpValidation,handleValidationErrors, authController.register);
router.post('/login',loginValidation,handleValidationErrors, authController.login);

router.get('/get-user', authController.getUser);

router.put('/update-user',updateProfileValidation,handleValidationErrors, authController.updateUser);
module.exports = router;
