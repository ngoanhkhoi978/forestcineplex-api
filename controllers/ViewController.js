const View = require('../models/View');
const Movie = require('../models/Movie');
const res = require('express/lib/response');
const mongoose = require('mongoose');

class ViewController {
    async incrementViews(req, res) {
        try {
            const { movieId } = req.params;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const view = await View.findOneAndUpdate(
                { movieId, date: today },
                { $inc: { count: 1 } },
                { upsert: true, new: true },
            );

            res.status(200).json(view);
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    }

    async getViewsByDay(req, res) {
        try {
            const { movieId } = req.params;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const view = await View.findOne({ movieId, date: today });

            res.status(200).json(view || { count: 0 });
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    }

    async getViewsByWeek(req, res) {
        try {
            const { movieId } = req.params;

            const today = new Date();
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
            firstDayOfWeek.setHours(0, 0, 0, 0);

            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

            const views = await View.aggregate([
                { $match: { movieId, date: { $gte: firstDayOfWeek, $lte: lastDayOfWeek } } },
                { $group: { _id: null, totalViews: { $sum: '$count' } } },
            ]);

            const totalViews = views.length ? views[0].totalViews : 0;

            res.status(200).json({ totalViews });
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    }

    async getViewsByMonth(req, res) {
        try {
            const { movieId } = req.params;

            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const views = await View.aggregate([
                { $match: { movieId, date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
                { $group: { _id: null, totalViews: { $sum: '$count' } } },
            ]);

            const totalViews = views.length ? views[0].totalViews : 0;

            res.status(200).json({ totalViews });
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    }
    async getTotalViews(req, res) {
        try {
            const { movieId } = req.params;

            const matchStage = {
                ...(movieId && { movieId: new mongoose.Types.ObjectId(movieId) }),
            };

            const views = await mongoose
                .model('View')
                .aggregate([{ $match: matchStage }, { $group: { _id: null, totalViews: { $sum: '$count' } } }]);

            const totalViews = views.length ? views[0].totalViews : 0;

            res.status(200).json({ count: totalViews });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new ViewController();
