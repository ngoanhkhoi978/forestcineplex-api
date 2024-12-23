const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');

const mongoose = require('mongoose');
const { convertMediaToHLS } = require('../utils/convertToHLS');
const deletePath = require('../utils/deletePath');
const path = require('path');

class EpisodeController {
    async getThumbnail(req, res) {
        const { filename } = req.params;
        const thumbnailPath = path.join(__dirname, '..', 'storage', 'thumbnails', filename);
        res.sendFile(thumbnailPath);
    }

    async getByMediaId(req, res) {
        const mediaId = req.params.mediaId;
        const episode = await Episode.findOne({ mediaId }).populate({
            path: 'movie',
            populate: [
                {
                    path: 'genres',
                },
                {
                    path: 'episodes',
                },
            ],
        });
        res.json(episode);
    }

    async add(req, res) {
        try {
            await convertMediaToHLS(req.idv4);

            const episode = await Episode.findOne({ _id: req.episodeId });
            Object.assign(episode, {
                description: req.body.description,
                duration: req.body.duration,
                episodeNumber: req.body.episodeNumber,
                mediaId: req.idv4,
                movie: new mongoose.Types.ObjectId(req.body.movieId),
                thumbnailUrl: `/api/episodes/thumbnail/${req.thumbnailFile}`,
            });
            await episode.save();

            await Movie.findByIdAndUpdate(req.body.movieId, { $addToSet: { episodes: episode._id } }, { new: true });
            await deletePath(path.join(__dirname, '..', 'storage', 'videos', 'medias', `${req.idv4}.mp4`));

            await res.status(200).json(episode);
        } catch (e) {
            await deletePath(path.join(__dirname, '..', 'storage', 'videos', 'medias', `${req.idv4}.mp4`));
            await deletePath(path.join(__dirname, '..', 'storage', 'thumbnails', req.thumbnailFile));
            await deletePath(path.join(__dirname, '..', 'storage', 'hls', 'medias', req.idv4));
            await Episode.deleteOne({ _id: req.episodeId });
            console.log(e);
            res.status(400).send({ message: e.message });
        }
    }

    async delete(req, res) {
        try {
            const { episodeId } = req.params;

            const episode = await Episode.findOne({ _id: episodeId });

            if (!episode) {
                res.status(404).send({ message: 'No episode found' });
            }

            if (episode.thumbnailUrl) {
                const thumbnailPath = path.join(
                    __dirname,
                    '..',
                    'storage',
                    'thumbnails',
                    episode.thumbnailUrl.split('/').at(-1),
                );
                await deletePath(thumbnailPath);
            }
            const mediaPath = path.join(__dirname, '..', 'storage', 'hls', 'medias', episode.mediaId);
            await deletePath(mediaPath);

            await Movie.findByIdAndUpdate(episode.movie, { $pull: { episodes: episodeId } }, { new: true });

            await Episode.deleteOne({ _id: episodeId });

            res.status(200).json(episode);
        } catch (e) {
            res.status(400).send({ message: e.message });
        }
    }

    async modify(req, res) {
        try {
            if (req.mediaFile) {
                await convertMediaToHLS(req.idv4);
                await deletePath(path.join(__dirname, '..', 'storage', 'videos', 'medias', `${req.idv4}.mp4`));
            }

            const { episodeId } = req.params;
            const episode = await Episode.findById(episodeId);

            Object.assign(episode, {
                description: req.body.description,
                episodeNumber: req.body.episodeNumber,
                duration: req.body.duration,
                thumbnailUrl: req.thumbnailFile ? `/api/movies/thumbnail/${req.thumbnailFile}` : episode.thumbnailUrl,
            });

            await episode.save();
            res.status(200).json(episode);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new EpisodeController();
