const express = require('express');
const user_route = express();

user_route.set('view engine', 'ejs');
user_route.set('views','./views');
user_route.use(express.static('public'));

const authController = require('../controllers/authController');

user_route.get('/mail-verification', authController.verifyMail);


module.exports = user_route;