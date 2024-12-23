const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
// const { getWebSocketServer } = require('../bin/webSocket');

const { notifyAdmins } = require('../config/socket');

const getTotalFrames = require('./getTotalFrames');

async function convertToHLS(inputPath, outputPath, options) {
    if (!fs.existsSync(inputPath)) {
        throw new Error('Input file does not exist');
    }

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const totalFrame = await getTotalFrames(inputPath);

    const baseOutputPath = path.join(outputDir, path.basename(inputPath, path.extname(inputPath)));

    if (options.multiResolution) {
        const resolutions = [
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
            { name: '480p', width: 854, height: 480, bitrate: '1400k' },
            { name: '240p', width: 426, height: 240, bitrate: '500k' },
        ];

        let completed = 0;
        let errors = [];
        const playlistEntries = [];

        const promises = resolutions.map((res) => {
            return new Promise((resolve, reject) => {
                const resolutionOutput = `${baseOutputPath}_${res.name}`;
                const ffmpegProcess = ffmpeg(inputPath)
                    .size(`${res.width}x${res.height}`)
                    .videoBitrate(res.bitrate)
                    .audioCodec('aac')
                    .videoCodec('libx264')
                    .format('hls')
                    .outputOptions([
                        '-hls_time 10',
                        '-hls_list_size 0',
                        '-hls_segment_filename',
                        `${resolutionOutput}_%03d.ts`,
                    ])
                    .output(`${resolutionOutput}.m3u8`)
                    .on('end', () => {
                        console.log(`Resolution ${res.name} conversion finished.`);

                        playlistEntries.push(
                            `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate, 10) * 1000},RESOLUTION=${res.width}x${res.height}\n${path.basename(resolutionOutput)}.m3u8`,
                        );

                        completed++;
                        if (completed === resolutions.length) {
                            const masterPlaylistContent = `#EXTM3U\n${playlistEntries.join('\n')}\n`;
                            fs.writeFileSync(`${baseOutputPath}_master.m3u8`, masterPlaylistContent);
                        }

                        resolve();
                    })
                    .on('error', (err) => {
                        console.error(`Error during conversion for ${res.name}:`, err);
                        errors.push(err);
                        completed++;
                        if (completed === resolutions.length) {
                            if (playlistEntries.length > 0) {
                                const masterPlaylistContent = `#EXTM3U\n${playlistEntries.join('\n')}\n`;
                                fs.writeFileSync(`${baseOutputPath}_master.m3u8`, masterPlaylistContent);
                            }

                            reject(errors);
                        }
                    });

                ffmpegProcess.on('stderr', (data) => {
                    const output = data.toString();
                    const frameMatch = output.match(/frame=\s*(\d+)/);

                    if (frameMatch) {
                        const frame = parseInt(frameMatch[1], 10) * 1000;
                        const progressData = {
                            resolution: res.name,
                            frame,
                            totalFrame,
                            resolutionIndex: resolutions.indexOf(res),
                            totalResolutions: resolutions.length,
                            id: options.id,
                        };

                        try {
                            notifyAdmins('processConvertHLS', { process: progressData });
                        } catch (error) {
                            console.error('Error getting WebSocket server:', error);
                        }
                    }
                });

                ffmpegProcess.run();
            });
        });

        try {
            await Promise.all(promises);
            return 'All resolutions converted successfully';
        } catch (err) {
            throw new Error('Error during conversion');
        }
    } else {
        const ffmpegProcess = ffmpeg(inputPath)
            .output(`${baseOutputPath}.m3u8`)
            .audioCodec('aac')
            .videoCodec('libx264')
            .format('hls')
            .outputOptions([
                '-hls_time 10',
                '-hls_list_size 0',
                '-hls_flags delete_segments',
                '-hls_segment_filename',
                `${baseOutputPath}_%03d.ts`,
            ])
            .on('end', () => {
                console.log('HLS conversion finished.');
            })
            .on('error', (err) => {
                console.error('Error during conversion:', err);
                throw err;
            });

        ffmpegProcess.on('stderr', (data) => {
            const output = data.toString();
            const frameMatch = output.match(/frame=\s*(\d+)/);
            if (frameMatch) {
                const frame = parseInt(frameMatch[1], 10) * 1000;
                const progressData = {
                    resolution: 'single',
                    frame,
                    totalFrame,
                    resolutionIndex: 1,
                    totalResolutions: 1,
                    id: options.id,
                };

                try {
                    notifyAdmins('processConvertHLS', { process: progressData });
                } catch (error) {
                    console.error('Error getting WebSocket server:', error);
                }
            }
        });

        ffmpegProcess.run();
        return new Promise((resolve, reject) => {
            ffmpegProcess.on('end', resolve);
            ffmpegProcess.on('error', reject);
        });
    }
}

async function convertTrailerToHLS(movieId) {
    try {
        const inputPath = path.join(__dirname, '..', 'storage', 'videos', 'trailers', `${movieId}.mp4`);
        const outputPath = path.join(__dirname, '..', 'storage', 'hls', 'trailers', movieId, `${movieId}.m3u8`);
        await convertToHLS(inputPath, outputPath, { multiResolution: false, id: movieId });
        console.log('Trailer conversion to HLS completed successfully');
    } catch (err) {
        console.error('Error converting trailer to HLS:', err);
        throw err;
    }
}

async function convertMediaToHLS(mediaId) {
    try {
        const inputPath = path.join(__dirname, '..', 'storage', 'videos', 'medias', `${mediaId}.mp4`);
        const outputPath = path.join(__dirname, '..', 'storage', 'hls', 'medias', mediaId, `${mediaId}.m3u8`);
        await convertToHLS(inputPath, outputPath, { multiResolution: true, id: mediaId });
        console.log('Media conversion to HLS completed successfully');
    } catch (err) {
        console.error('Error converting media to HLS:', err);
        throw err;
    }
}

module.exports = { convertToHLS, convertTrailerToHLS, convertMediaToHLS };
