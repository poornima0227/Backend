const { check, validationResult  } = require('express-validator');

exports.signUpValidation = [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password is required').isLength({ min: 6 }),
];

exports.loginValidation = [
    check('email', 'Please enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password is required').isLength({ min: 6 }),
];


exports.updateProfileValidation = [
    check('name', 'Name is required').not().isEmpty(),

    check('age', 'Age must be a number and at least 18').isInt({ min: 18 }),

    check('address', 'Address is required').not().isEmpty(),
];


exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation failed');
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    console.log('Validation passed');
    next();
};
