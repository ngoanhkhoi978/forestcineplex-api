const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

class GenreController {
    async getAll(req, res) {
        try {
            const genres = await Genre.find();
            res.status(200).json(genres);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getGenresWithPagination(req, res) {
        const { index = 1, limit = 5, search } = req.query;

        const pageIndex = parseInt(index) - 1;
        const pageLimit = parseInt(limit);

        let filter = {};

        if (search) {
            filter = {
                $or: [
                    {
                        name: {
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

        const totalItems = await Genre.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / pageLimit);

        const genres = await Genre.find(filter)
            .skip(pageIndex * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            genres,
            totalPages,
        });
    }

    async getById(req, res) {
        try {
            const { genreId } = req.params;
            const genres = await Genre.findOne({ _id: genreId });
            res.status(200).json(genres);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async addGenre(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ validate: { name: 'Name is required.' } });
            }

            const newGenre = new Genre({ name });
            await newGenre.save();

            res.status(201).json(newGenre);
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ validate: { name: 'Genre name must be unique.' } });
            }

            if (error.name === 'ValidationError') {
                const errors = Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ validate: errors });
            }

            res.status(500).json({ message: error.message });
        }
    }

    async editGenre(req, res) {
        try {
            const { genreId } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ validate: { name: 'Name is required.' } });
            }

            const updatedGenre = await Genre.findByIdAndUpdate(genreId, { name }, { new: true });

            if (!updatedGenre) {
                return res.status(404).json({ message: 'Genre not found.' });
            }

            res.status(200).json(updatedGenre);
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ validate: { name: 'Genre name must be unique.' } });
            }

            if (error.name === 'ValidationError') {
                const errors = Object.keys(error.errors).reduce((acc, key) => {
                    acc[key] = error.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ validate: errors });
            }

            res.status(500).json({ message: error.message });
        }
    }

    async deleteGenre(req, res) {
        try {
            const { genreId } = req.params;
            const result = await Genre.deleteOne({ _id: genreId });
            res.status(200).json(result);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getCountMovie(req, res) {
        try {
            const { genreId } = req.params;
            const count = await Movie.countDocuments({ genres: genreId });
            res.status(200).json({ count });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new GenreController();
