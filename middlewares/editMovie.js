const Movie = require('../models/Movie');
const mongoose = require('mongoose');

const editMovie = async (req, res, next) => {
    const { movieId } = req.params;
    const movie = await Movie.findOne({ _id: movieId });
    req.movieId = movieId;
    req.movie = movie;

    next();
};

module.exports = editMovie;
