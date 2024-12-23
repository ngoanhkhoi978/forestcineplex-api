const Rating = require('../models/Rating');
const mongoose = require('mongoose');

class RatingController {
    async addRating(req, res) {
        try {
            const { userId, movieId, score } = req.body;

            if (!userId || !movieId || typeof score !== 'number') {
                return res.status(400).json({ error: 'Invalid data' });
            }

            const existingRating = await Rating.findOne({ userId, movieId });
            if (existingRating) {
                return res.status(400).json({ error: 'User has already rated this movie' });
            }

            const newRating = new Rating({ userId, movieId, score });
            await newRating.save();

            res.status(201).json(newRating);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteRating(req, res) {
        try {
            const { ratingId } = req.params;

            const deletedRating = await Rating.findByIdAndDelete(ratingId);

            if (!deletedRating) {
                return res.status(404).json({ error: 'Rating not found' });
            }

            res.status(200).json({ message: 'Rating deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRatingsByMovie(req, res) {
        try {
            const { movieId } = req.params;

            const ratings = await Rating.find({ movieId }).populate('userId', 'name');

            res.status(200).json(ratings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getAverageRating(req, res) {
        try {
            const { movieId } = req.params;

            const result = await Rating.aggregate([
                { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
                { $group: { _id: null, averageScore: { $avg: '$score' } } },
            ]);

            const averageScore = result.length ? result[0].averageScore : 0;

            res.status(200).json({ averageScore: averageScore.toFixed(2) });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getReviewInformation(req, res) {
        try {
            const { movieId } = req.params;
            const ratings = await Rating.find({ movieId });
            const starCounts = Array(5).fill(0);
            ratings.forEach((rating) => {
                if (rating.score >= 1 && rating.score <= 5) {
                    starCounts[rating.score - 1]++; // Tăng số lượng sao tương ứng
                }
            });
            const ratingCount = ratings.length;
            const averageRating =
                ratingCount > 0 ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratingCount : 0;
            res.status(200).json({
                ratingCount,
                oneStar: starCounts[0],
                twoStars: starCounts[1],
                threeStars: starCounts[2],
                fourStars: starCounts[3],
                fiveStars: starCounts[4],
                averageRating: averageRating.toFixed(2),
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = new RatingController();
