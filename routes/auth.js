const express = require('express');
const router = express.Router();
const authenticationToken = require('../middlewares/authenticationToken');
const authController = require('../controllers/authController');

/* GET users listing. */
router.post('/login', authController.login);
router.get('/verify-token', authenticationToken, authController.verify);
router.get('/login', (req, res) => {
    res.json({ mess: 'auth login' });
});

module.exports = router;
