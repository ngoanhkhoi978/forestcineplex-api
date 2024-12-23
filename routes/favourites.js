const express = require('express');
const router = express.Router();

const favouritesController = require('../controllers/FavouriteController');

router.get('/:userId', favouritesController.getFavouriteMovies);
router.post('/:userId/:movieId', favouritesController.addFavouriteMovie);
router.delete('/:userId/:movieId', favouritesController.deleteFavouriteMovie);

module.exports = router;
