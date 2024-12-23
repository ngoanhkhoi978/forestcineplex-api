const { body } = require('express-validator');
const User = require('../models/User');

function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    if (!passwordRegex.test(password)) {
        return 'Password must be at least 5 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    return null;
}

const loginValidator = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            if (!user) {
                throw new Error('Username not found');
            }
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ username: req.body.username });
            if (user) {
                const isMatch = await user.comparePassword(value);
                if (!isMatch) {
                    throw new Error('Password is incorrect');
                }
            }
            return true;
        }),
];

const registerValidator = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 4, max: 30 })
        .withMessage('Username must be between 4 and 30 characters')
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            if (user) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('Email already exists');
            }
            return true;
        }),

    body('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/)
        .withMessage('Invalid phone number format'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

const modifyProfileValidator = [
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/)
        .withMessage('Invalid phone number format'),
];

const changePasswordValidator = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required')
        .custom(async (value, { req }) => {
            const user = await User.findById(req.userId);
            const isMatch = await user.comparePassword(value);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
            return true;
        }),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('confirmNewPassword')
        .notEmpty()
        .withMessage('New password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

const forgotPasswordValidator = [
    body('identifier')
        .notEmpty()
        .withMessage('Please enter username or email')
        .custom(async (value) => {
            let user = await User.findOne({ username: value });
            if (!user) {
                user = await User.findOne({ email: value });
            }
            if (!user) {
                throw new Error('Invalid username or email');
            }
            return true;
        }),
];

const resetPassword = [
    body('otp')
        .notEmpty()
        .withMessage('OTP is required')
        .custom(async (value, { req }) => {
            const { identifier } = req.body;
            let user = await User.findOne({ email: identifier });
            if (!user) {
                user = await User.findOne({ username: identifier });
            }

            if (!user.resetPassword) {
                throw new Error('OTP not sent yet');
            }

            if (user.resetPassword.expires < Date.now()) {
                throw new Error('OTP has expired');
            }

            if (user.resetPassword.OTP !== value) {
                throw new Error('Invalid OTP');
            }

            return true;
        }),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('confirmNewPassword')
        .notEmpty()
        .withMessage('New password is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];

module.exports = {
    validatePassword,
    registerValidator,
    loginValidator,
    modifyProfileValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPassword,
};
