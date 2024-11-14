const Movie = require('../models/Movie');
const mongoose = require('mongoose');

const createMovie = async (req, res, next) => {
    const movie = new Movie({});
    await movie.save();
    req.movieId = movie._id;
    next();
};

module.exports = createMovie;
