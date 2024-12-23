const Favourite = require('../models/Favourite');
const Movie = require('../models/Movie');
const User = require('../models/User');

class FavouriteController {
    // [GET] /:userId
    async getFavouriteMovies(req, res) {
        try {
            const { userId } = req.params;
            const favourites = await Favourite.find({ userId }).populate({
                path: 'movieId',
                populate: [{ path: 'episodes' }, { path: 'genres', select: 'name' }],
            });
            res.status(200).json(favourites);
        } catch (e) {
            return res.status(404).json({ message: 'No favourite movies found' });
        }
    }
    async addFavouriteMovie(req, res) {
        try {
            const { userId, movieId } = req.params;
            const favourite = new Favourite({ userId, movieId });
            await favourite.save();
            res.status(200).json(favourite);
        } catch (e) {
            console.log();
            res.status(500).send({ message: e });
        }
    }

    async deleteFavouriteMovie(req, res) {
        try {
            const { userId, movieId } = req.params;
            const result = await Favourite.deleteOne({ userId, movieId });
            res.status(200).json(result);
        } catch (e) {
            res.status(500).send({ message: e });
        }
    }
}

module.exports = new FavouriteController();
