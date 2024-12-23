const express = require('express');
const router = express.Router();

const genreController = require('../controllers/GenreController');

router.get('/paginated', genreController.getGenresWithPagination);
router.get('/:genreId/count', genreController.getCountMovie);
router.get('/:genreId', genreController.getById);
router.post('/:genreId', genreController.editGenre);
router.delete('/:genreId', genreController.deleteGenre);
router.post('/', genreController.addGenre);
router.get('/', genreController.getAll);

module.exports = router;
