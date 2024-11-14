const Genre = require('../models/Genre');

class GenreController {
    async getAll(req, res) {
        try {
            const genres = await Genre.find();
            res.status(200).json(genres);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = new GenreController();
