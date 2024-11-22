const Episode = require('../models/Episode');
const createEpisode = async (req, res, next) => {
    const episode = new Episode({});
    await episode.save();
    req.episodeId = episode._id;
    next();
};

module.exports = createEpisode;
