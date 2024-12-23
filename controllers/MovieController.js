const path = require('path');
const streamVideo = require('../utils/streamVideo');
const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Genre = require('../models/Genre');
const Favourite = require('../models/Favourite');
const { convertTrailerToHLS, convertToHLS } = require('../utils/convertToHLS');

const env = require('../config/environment');

const deletePath = require('../utils/deletePath');
const { populate } = require('dotenv');

class MovieController {
    index(req, res) {
        const videoPath = path.join(__dirname, '..', 'storage', 'movies', 'movie.mp4');
        const range = req.headers.range;
        streamVideo(videoPath, res, range);
    }

    test(req, res) {
        res.send({ mess: env.JWT_SECRET });
    }

    convert(req, res) {
        const inputPath = path.join(
            __dirname,
            '..',
            'protected',
            'uploads',
            'trailers',
            '673178ae8dfd77caa394091d.mp4',
        );
        const outputPath = path.join(
            __dirname,
            '..',
            'public',
            'trailers',
            '673178ae8dfd77caa394091d',
            '673178ae8dfd77caa394091d.m3u8',
        );

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
    async searchMovie(req, res) {
        const { title, genre, cast, director } = req.query;

        const filter = {};
        if (title) {
            filter.title = {
                $regex: `^${title}`,
                $options: 'i',
            };
        }

        if (genre) {
            const genreModel = await Genre.findOne({ name: { $regex: genre, $options: 'i' } });
            if (genreModel) {
                filter.genres = { $in: genreModel._id };
            }
        }

        if (cast) {
            filter.casts = { $regex: cast, $options: 'i' };
        }

        if (director) {
            filter.directors = { $regex: director, $options: 'i' };
        }

        if (Object.keys(filter).length === 0) {
            return res.status(404).json({ mess: 'Not found' });
        }

        const movies = await Movie.find(filter).populate('episodes').populate('genres');

        if (movies.length === 0) {
            return res.status(404).json({ mess: 'Not found' });
        }
        res.json(movies);
    }

    // [GET] /title/:title
    getMovieByTitle(req, res) {
        const title = req.params.title;
    }

    // [GET] /genre/:genre
    async getMovieByGenre(req, res) {
        try {
            const { genre } = req.params;
            const { limit, index = 1, isSeries = null } = req.query;
            const genreModel = await Genre.findOne({ name: genre });
            if (!genreModel) res.status(404).send({ message: 'Not found' });
            let movie;

            let filter = { genres: genreModel._id };

            if (isSeries !== null) {
                if (isSeries === 'true') {
                    filter.isSeries = true;
                } else if (isSeries === 'false') {
                    filter.isSeries = false;
                }
            }

            if (limit) {
                const pageIndex = parseInt(index) - 1;
                const pageLimit = parseInt(limit);
                movie = await Movie.find(filter)
                    .skip(pageIndex * pageLimit)
                    .limit(pageLimit)
                    .populate('genres')
                    .populate('episodes');
            } else {
                movie = await Movie.find(filter).populate('genres').populate('episodes');
            }

            res.status(200).send(movie);
        } catch (e) {
            console.log(e);
            res.status(404).send({ message: 'error' });
        }
    }

    // [GET] /:movieId
    async getMovieById(req, res) {
        try {
            const { movieId } = req.params;

            const movie = await Movie.findOne({ _id: movieId }).populate('episodes').populate('genres');
            res.status(200).json(movie);
        } catch (e) {
            console.log(e);
            res.status(404).send({ message: 'Not found' });
        }
    }

    async getRandomMovie(req, res) {
        try {
            const size = parseInt(req.query.size) || 1;
            const movies = await Movie.aggregate([
                { $sample: { size: size } },
                {
                    $lookup: {
                        from: 'episodes',
                        localField: 'episodes',
                        foreignField: '_id',
                        as: 'episodes',
                    },
                },
                {
                    $lookup: {
                        from: 'genres',
                        localField: 'genres',
                        foreignField: '_id',
                        as: 'genres',
                    },
                },
            ]);

            res.json(movies);
        } catch (e) {
            console.error(e);
            res.status(404).json({ message: 'error' });
        }
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
            const { index = 1, limit = 5, search, q } = req.query;

            const pageIndex = parseInt(index) - 1;
            const pageLimit = parseInt(limit);

            let filter = {};

            if (search) {
                filter = {
                    $or: [
                        {
                            title: {
                                $regex: `^${search}`,
                                $options: 'i', //
                            },
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: '$_id' },
                                    regex: `^${search}`,
                                    options: 'i',
                                },
                            },
                        },
                    ],
                };
            }

            const totalItems = await Movie.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / pageLimit);

            const movies = await Movie.find(filter)
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

        if (movie.coverImageUrl) {
            const coverPath = path.join(__dirname, '..', 'storage', 'covers', movie.coverImageUrl.split('/').at(-1));
            await deletePath(coverPath);
        }

        if (movie.thumbnailUrl) {
            const thumbnailPath = path.join(
                __dirname,
                '..',
                'storage',
                'thumbnails',
                movie.thumbnailUrl.split('/').at(-1),
            );
            await deletePath(thumbnailPath);
        }

        if (movie.trailerUrl) {
            const trailerPath = path.join(
                __dirname,
                '..',
                'storage',
                'hls',
                'trailers',
                movie.trailerUrl.split('/').at(-2),
            );
            await deletePath(trailerPath).catch((err) => console.log(err));
        }

        for (const episodeId of movie.episodes) {
            const episode = await Episode.findById(episodeId);

            if (episode) {
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

                if (episode.mediaId) {
                    const mediaPath = path.join(__dirname, '..', 'storage', 'hls', 'medias', episode.mediaId);
                    await deletePath(mediaPath);
                }

                await Episode.deleteOne({ _id: episodeId });
            }
        }

        await Favourite.deleteMany({ movieId: movieId });
        await Movie.deleteOne({ _id: movieId });

        res.status(200).send({ mess: 'success' });
    }

    // [GET] /media/:mediaId/:filename
    getMedia(req, res) {
        const { mediaId, filename } = req.params;
        const filePath = path.join(__dirname, '..', 'storage', 'hls', 'medias', mediaId, filename);
        res.sendFile(filePath);
    }

    async getTrailer(req, res) {
        const { filename, movieId } = req.params;
        const trailerPath = path.join(__dirname, '..', 'storage', 'hls', 'trailers', movieId, filename);
        res.sendFile(trailerPath);
    }

    async getThumbnail(req, res) {
        const { filename } = req.params;
        const thumbnailPath = path.join(__dirname, '..', 'storage', 'thumbnails', filename);
        res.sendFile(thumbnailPath);
    }

    async getCoverImage(req, res) {
        const { filename } = req.params;
        const coverImagePath = path.join(__dirname, '..', 'storage', 'covers', filename);
        res.sendFile(coverImagePath);
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
                thumbnailUrl: `/api/movies/thumbnail/${req.thumbnailFile}`,
                coverImageUrl: `/api/movies/cover-image/${req.coverFile}`,
                trailerUrl: `/api/movies/trailer/${req.movieId}/${req.movieId}.m3u8`,
                isSeries: req.body.isSeries,
            });
            await movie.save();
            await deletePath(path.join(__dirname, '..', 'storage', 'videos', 'trailers', `${req.movieId}.mp4`));
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
                await deletePath(path.join(__dirname, '..', 'storage', 'videos', 'trailers', `${req.movieId}.mp4`));
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
                thumbnailUrl: req.thumbnailFile ? `/api/movies/thumbnail/${req.thumbnailFile}` : movie.thumbnailUrl,
                coverImageUrl: req.coverFile ? `/api/movies/cover-image/${req.coverFile}` : movie.coverImageUrl,
                isSeries: req.body.isSeries,
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
