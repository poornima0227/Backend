const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const gardenController = require('../controllers/gardenController');
const articleController = require('../controllers/articleController');
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

router.get('/get-article', articleController.getArticles); // Get all articles
router.post('/add-article', articleController.addArticle); // Add an article

router.post("/add-details", gardenController.addDetails);
router.get("/get-details", gardenController.getDetails);

router.post("/add-task", authController.addTask);

module.exports = router;
