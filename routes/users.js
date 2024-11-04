const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');

/* GET users listing. */
router.post('/', (req, res) => {
    res.json({
        mess: 'hello',
    });
});
router.get('/', userController.index);

module.exports = router;
