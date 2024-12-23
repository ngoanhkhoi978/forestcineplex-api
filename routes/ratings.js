const express = require('express');
const router = express.Router();

const ratingController = require('../controllers/RatingController');

router.get('/:movieId', ratingController.getRatingsByMovie);
router.get('/review-information/:movieId', ratingController.getReviewInformation);
router.get('/average-rating/:movieId', ratingController.getAverageRating);

module.exports = router;
