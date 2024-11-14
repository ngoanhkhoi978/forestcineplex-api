const path = require('path');
const streamVideo = require('../utils/streamVideo');
const convertToHLS = require('../utils/convertToHLS'); // Đảm bảo đường dẫn đúng
const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');
const { convertTrailerToHLS } = require('../utils/convertToHLS');

const deletePath = require('../utils/deletePath');

class MovieController {
    index(req, res) {
        const videoPath = path.join(__dirname, '..', 'storage', 'movies', 'movie.mp4');
        const range = req.headers.range;
        streamVideo(videoPath, res, range);
    }

    test(req, res) {
        res.send({ success: true });
    }

    convert(req, res) {
        const inputPath = path.join(__dirname, '..', 'protected', 'uploads', 'medias', 'movie_2.mp4');
        const outputPath = path.join(__dirname, '..', 'protected', 'hls', 'movies', 'movie_2', 'movie_2.m3u8');

        console.log(inputPath);

        convertToHLS(inputPath, outputPath, (error, message) => {
            if (error) {
                console.error('Conversion failed:', error);
            } else {
                res.send({ mess: message });
            }
        });
    }
    hls(req, res) {}

    // [GET] /search
    searchMovie(req, res) {
        Movie.find(req.query).then((movies) => {
            res.send(movies);
        });
    }

    // [GET] /title/:title
    getMovieByTitle(req, res) {
        const title = req.params.title;
    }

    // [GET] /genre/:genre
    getMovieByGenre(req, res) {
        const genre = req.params.genre;
    }

    // [GET] /:movieId
    getMovieById(req, res) {
        const _id = req.params.movieId;
        Movie.findOne({ _id })
            .then((movie) => {
                res.status(200).json(movie);
            })
            .catch((err) => {
                res.status(404).json(err);
            });
    }

    async getAllMovies(req, res) {
        try {
            const movies = await Movie.find();
            res.status(200).json(movies);
        } catch (err) {
            res.status(500).json({ message: 'Error' });
        }
    }

    async getMoviesWithPagination(req, res) {
        try {
            const { index = 1, limit = 5, q } = req.query;

            const pageIndex = parseInt(index) - 1;
            const pageLimit = parseInt(limit);

            const totalItems = await Movie.countDocuments();
            const totalPages = Math.ceil(totalItems / pageLimit);

            const movies = await Movie.find()
                .skip(pageIndex * pageLimit)
                .limit(pageLimit)
                .populate('genres')
                .populate(q === 'true' ? 'episodes' : '');

            res.status(200).json({
                movies,
                totalPages,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Error' });
        }
    }

    // [DELETE] /:movieId
    async deleteMovieById(req, res) {
        const { movieId } = req.params;
        const movie = await Movie.findOne({ _id: movieId });
        if (!movie) {
            return res.status(404).json({ message: 'No movie found' });
        }
        const coverPath = path.join(__dirname, '..', ...movie.coverImageUrl.split('/'));
        const thumbnailPath = path.join(__dirname, '..', ...movie.thumbnailUrl.split('/'));
        const trailerPath = path.join(__dirname, '..', ...movie.trailerUrl.split('/').slice(0, -1));
        await Movie.deleteOne({ _id: movieId });
        await deletePath(coverPath);
        await deletePath(thumbnailPath);
        await deletePath(trailerPath).catch((err) => console.log(err));
        res.status(200).send({ mess: 'success' });
    }

    // [GET] /media/:mediaId/:filename
    getMedia(req, res) {
        const { mediaId, filename } = req.params;
        const filePath = path.join(__dirname, '..', 'protected', 'medias', mediaId, filename);
        res.sendFile(filePath);
    }

    // [POST] /
    async addMovie(req, res) {
        try {
            await convertTrailerToHLS(req.movieId.toString());

            const movie = await Movie.findOne({ _id: req.movieId });
            Object.assign(movie, {
                title: req.body.title,
                description: req.body.description,
                casts: req.body.casts,
                directors: req.body.directors,
                genres: req.body.genres,
                releaseDate: req.body.releaseDate,
                episodes: [],
                thumbnailUrl: `/public/thumbnails/${req.thumbnailFile}`,
                coverImageUrl: `/public/covers/${req.coverFile}`,
                trailerUrl: `/public/trailers/${req.movieId}/${req.movieId}.m3u8`,
            });
            await movie.save();
            await deletePath(path.join(__dirname, '..', 'protected', 'uploads', 'trailers', `${req.movieId}.mp4`));
            res.status(200).json(movie);
        } catch (err) {
            console.log(err);
            res.status(400).json({ mess: err });
        }
    }

    // [PUT] /
    async editMovie(req, res) {
        try {
            if (req.trailerFile) {
                await convertTrailerToHLS(req.movieId.toString());
                await deletePath(path.join(__dirname, '..', 'protected', 'uploads', 'trailers', `${req.movieId}.mp4`));
            }
            const { movieId } = req.params;
            const movie = await Movie.findOne({ _id: movieId });
            Object.assign(movie, {
                title: req.body.title,
                description: req.body.description,
                casts: req.body.casts,
                directors: req.body.directors,
                genres: req.body.genres,
                releaseDate: req.body.releaseDate,
                thumbnailUrl: req.thumbnailFile ? `/public/thumbnails/${req.thumbnailFile}` : movie.thumbnailUrl,
                coverImageUrl: req.coverFile ? `/public/covers/${req.coverFile}` : movie.coverImageUrl,
            });
            await movie.save();
            res.status(200).json(movie);
        } catch (e) {
            console.log(err);
            res.status(400).json({ mess: err });
        }
    }
}

module.exports = new MovieController();
