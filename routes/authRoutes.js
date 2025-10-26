const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const gardenController = require('../controllers/gardenController');
const articleController = require('../controllers/articleController');
const cropController = require('../controllers/cropController');

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
router.put('/update-user', updateProfileValidation, handleValidationErrors, authController.updateUser);

// Garden item routes
router.get('/get-items', gardenController.getItem);
router.post('/add-items', gardenController.addItem); // Removed Multer

router.post('/add-article', articleController.addArticle); // Removed Multer
router.get('/get-article/:id?', articleController.getArticle);

router.post("/add-details", gardenController.addDetails);
router.get("/get-details", gardenController.getDetails);

router.post("/add-task", authController.addTask);

router.post("/calculate", cropController.calculate);

module.exports = router;
