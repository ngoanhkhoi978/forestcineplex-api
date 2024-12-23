const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');

/* GET users listing. */
router.get('/paginated', userController.getUsersWithPagination);
router.get('/:userId', userController.getUserById);
router.delete('/:userId', userController.deleteUserById);
router.put('/:userId', userController.editUser);
router.post('/', userController.addUser);
router.get('/', userController.getAllUsers);

module.exports = router;
