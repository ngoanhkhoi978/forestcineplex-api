const User = require('../models/User');
const Rating = require('../models/Rating');
const Favourite = require('../models/Favourite');
const Movie = require('../models/Movie');
const { validationResult } = require('express-validator');

class MeController {
    async choosePlan(req, res) {
        try {
            const userId = req.userId;
            const { subscriptionPlan } = req.body;
            const user = await User.findById(userId);
            user.subscriptionPlan = subscriptionPlan;
            await user.save();
            res.status(200).json(user.toSafeObject());
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async rateMovie(req, res) {
        try {
            const { movieId, score } = req.body;
            const userId = req.userId;

            console.log(movieId, score, userId);
            if (score === 0) {
                await Rating.deleteOne({ movieId, userId });
            } else {
                const rating = await Rating.findOne({ userId, movieId });
                if (rating) {
                    rating.score = score;
                    await rating.save();
                    return res.status(200).json(rating);
                } else {
                    const newRating = new Rating({ score, movieId, userId });
                    await newRating.save();
                    return res.status(200).json(newRating);
                }
            }
            res.status(200).json();
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async getRatingMovie(req, res) {
        try {
            console.log('hello');
            const { movieId } = req.params;
            const userId = req.userId;

            const rating = await Rating.findOne({ movieId, userId });
            res.status(200).json(rating);
        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async addFavouriteMovie(req, res) {
        try {
            const { movieId } = req.params;
            const userId = req.userId;

            const favourite = new Favourite({ userId, movieId });
            await favourite.save();
            const returnFavourite = await Favourite.findOne({ userId, movieId }).populate({
                path: 'movieId',
                populate: [{ path: 'episodes' }, { path: 'genres', select: 'name' }],
            });
            res.status(200).json(returnFavourite);
        } catch (e) {
            console.log();
            res.status(500).send({ message: e });
        }
    }

    async deleteFavouriteMovie(req, res) {
        try {
            const { movieId } = req.params;

            const userId = req.userId;
            const result = await Favourite.deleteOne({ userId, movieId });
            res.status(200).json(result);
        } catch (e) {
            res.status(500).send({ message: e });
        }
    }

    async modifyProfile(req, res) {
        try {
            const userId = req.userId;
            const { fullName, phone } = req.body;

            let buffer = null;
            if (req.file) {
                buffer = req.file.buffer;
            }
            const user = await User.findOne({ _id: userId });
            user.fullName = fullName;
            user.phone = phone;
            if (buffer) {
                user.avatar = buffer;
            }
            await user.save();
            res.status(200).json(user.toSafeObject());
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ validators: errors.array() });
            }
            const userId = req.userId;
            const { newPassword } = req.body;
            const user = await User.findOne({ _id: userId });
            user.password = newPassword;
            user.save();
            res.status(200).json(user);
        } catch (e) {
            res.status(500).send({ message: e });
        }
    }
}

module.exports = new MeController();
