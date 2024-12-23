const Comment = require('../models/Comment');
const User = require('../models/User');
const Episode = require('../models/Episode');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');

class CommentController {
    async getAllComments(req, res) {
        try {
            const { isReport } = req.query;
            let filter = {};
            if (isReport === 'true') {
                filter = { 'reports.0': { $exists: true } };
            }

            const comments = await Comment.find(filter)
                .populate({
                    path: 'userId',
                    select: 'username',
                })
                .populate({
                    path: 'episodeId',
                    select: 'movie episodeNumber',
                    populate: {
                        path: 'movie',
                        select: 'title',
                    },
                })
                .populate({
                    path: 'reports',
                    select: 'username',
                });

            res.status(200).send(comments);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async getCommentsByEpisodeId(req, res) {
        try {
            const { episodeId } = req.params;
            const comments = await Comment.find({ episodeId }).populate({
                path: 'userId',
                select: 'username fullName _id avatar',
            });
            res.status(200).json(comments);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async addComment(req, res) {
        try {
            const userId = req.userId;
            const { episodeId, content } = req.body;
            const comment = new Comment({ userId, episodeId, content });

            await comment.save();
            await comment.populate({
                path: 'userId',
                select: 'username fullName _id avatar',
            });

            res.status(200).json(comment);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const result = await Comment.deleteOne({ _id: commentId });
            res.status(200).json(result);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async likeComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.userId;
            const comment = await Comment.findById(commentId);
            if (comment.likes.includes(userId)) {
                return res.status(400).json({ message: 'User already liked this comment' });
            }
            comment.likes.push(userId);
            await comment.save();
            res.status(200).json(comment);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async reportComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.userId;
            const comment = await Comment.findById(commentId);
            if (comment.reports.includes(userId)) {
                return res.status(400).json({ message: 'User already reports this comment' });
            }
            comment.reports.push(userId);
            await comment.save();
            res.status(200).json(comment);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async unlikeComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.userId;
            const comment = await Comment.findById(commentId);

            const likeIndex = comment.likes.findIndex((like) => like == userId);

            console.log(comment.likes);

            if (likeIndex === -1) {
                return res.status(400).json({ message: 'User has not liked this comment' });
            }

            comment.likes.splice(likeIndex, 1);

            await comment.save();

            res.status(200).json(comment);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }

    async unReportComment(req, res) {
        try {
            const userId = req.userId;
            const { commentId } = req.params;
            const comment = await Comment.findById(commentId);

            const reportIndex = comment.reports.findIndex((report) => report == userId);

            if (reportIndex === -1) {
                return res.status(400).json({ message: 'User has not reported this comment' });
            }

            comment.reports.splice(reportIndex, 1);

            await comment.save();

            res.status(200).json(comment);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: e });
        }
    }
}

module.exports = new CommentController();
