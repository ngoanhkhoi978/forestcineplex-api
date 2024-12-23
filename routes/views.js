const express = require('express');
const router = express.Router();

const viewController = require('../controllers/viewController');

router.get('/day/:movieId', viewController.getViewsByDay);

router.get('/week/:movieId', viewController.getViewsByWeek);

router.get('/month/:movieId', viewController.getViewsByMonth);

router.get('/:movieId', viewController.getTotalViews);

router.post('/:movieId', viewController.incrementViews);

module.exports = router;
