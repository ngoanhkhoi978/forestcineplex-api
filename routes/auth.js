const express = require('express');
const router = express.Router();
const authenticationToken = require('../middlewares/authenticationToken');
const authController = require('../controllers/authController');

const { registerValidator, loginValidator, forgotPasswordValidator, resetPassword } = require('../utils/validators');

const authorize = require('../middlewares/authorize');

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPassword, authController.resetPassword);
router.post('/login/admin', authController.loginAdmin);
router.get('/verify-token', authenticationToken, authController.verify);
router.get('/verify-token/admin', authenticationToken, authorize(['admin']), authController.verify);
router.get('/logout/admin', authenticationToken, authorize(['admin']), authController.logoutAdmin);
router.get('/logout', authenticationToken, authController.logout);

module.exports = router;
