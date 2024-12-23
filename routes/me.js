const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { changePasswordValidator } = require('../utils/validators');

const meController = require('../controllers/MeController');

router.post('/subscription-plan/choose', meController.choosePlan);
router.get('/rating-movie/:movieId', meController.getRatingMovie);
router.post('/rate-movie', meController.rateMovie);
router.post('/favourite-movie/:movieId', meController.addFavouriteMovie);
router.delete('/favourite-movie/:movieId', meController.deleteFavouriteMovie);
router.put('/profile', upload.single('avatar'), meController.modifyProfile);
router.put('/profile/change-password', changePasswordValidator, meController.changePassword);

module.exports = router;
