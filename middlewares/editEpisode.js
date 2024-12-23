const Episode = require('../models/Episode');
const mongoose = require('mongoose');

const editEpisode = async (req, res, next) => {
    const { episodeId } = req.params;

    const episode = await Episode.findById(episodeId);

    req.episode = episode;
    req.episodeId = episodeId;
    req.idv4 = episode.mediaId;
    next();
};

module.exports = editEpisode;
