const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const gardenController = require('../controllers/gardenController');
const upload = require('../middleware/uploadMiddleware');
const {
  signUpValidation,
  loginValidation,
  updateProfileValidation,
  handleValidationErrors,
} = require('../helpers/validation');

// Authentication routes
router.post('/register', signUpValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.get('/get-user', authController.getUser);
router.put('/update-user',upload.single('photo'), updateProfileValidation, handleValidationErrors, authController.updateUser);

// Garden item routes
router.get('/get-items', gardenController.getItem);
router.post('/add-items', upload.single('picture'), gardenController.addItem);

module.exports = router;
