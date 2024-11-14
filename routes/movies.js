const express = require('express');
const router = express.Router();

const createMovie = require('../middlewares/createMovie');
const upload = require('../middlewares/uploadFile');

const movieController = require('../controllers/movieController');

/* GET users listing. */

router.get('/test', movieController.test);

router.get('/media/:mediaId/:filename', movieController.getMedia);

router.get('/trailer', movieController.index);

router.get('/convert', movieController.convert);

router.get('/hls', movieController.hls);

// Movie
router.get('/title/:title', movieController.getMovieByTitle);

router.get('/genre/:genre', movieController.getMovieByGenre);

router.get('/search', movieController.searchMovie);

router.get('/paginated', movieController.getMoviesWithPagination);

router.post('/add');

router.get('/:movieId', movieController.getMovieById);

router.delete('/:movieId', movieController.deleteMovieById);

router.post(
    '/',

    createMovie,
    upload.fields([
        { name: 'coverFile', maxCount: 1 },
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'trailerFile', maxCount: 1 },
    ]),
    movieController.addMovie,
);

router.get('/', movieController.getAllMovies);

module.exports = router;
