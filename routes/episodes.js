const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadFile');
const createIdv4 = require('../middlewares/createIdv4');
const createEpisode = require('../middlewares/createEpisode');

const episodeController = require('../controllers/EpisodeController');

router.delete('/:episodeId', episodeController.delete);

router.get('/thumbnail/:filename', episodeController.getThumbnail);

router.post(
    '/',
    createIdv4,
    createEpisode,
    upload.fields([
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'mediaFile', maxCount: 1 },
    ]),
    episodeController.add,
);

module.exports = router;
