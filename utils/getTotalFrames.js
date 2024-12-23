const ffmpeg = require('fluent-ffmpeg');

function getTotalFrames(inputVideoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputVideoPath, (err, metadata) => {
            if (err) {
                return reject('Error getting video metadata: ' + err.message);
            }

            const fps = metadata.streams[0].r_frame_rate.split('/')[0];
            const duration = metadata.format.duration;

            const totalFrames = Math.round(fps * duration);

            resolve(totalFrames);
        });
    });
}

module.exports = getTotalFrames;
