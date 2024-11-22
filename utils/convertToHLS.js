const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');

function convertToHLS(inputPath, outputPath, callback, options) {
    if (!fs.existsSync(inputPath)) {
        return callback(new Error('Input file does not exist'));
    }

    // Tạo thư mục đầu ra nếu chưa tồn tại
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const baseOutputPath = path.join(outputDir, path.basename(inputPath, path.extname(inputPath)));

    // Nếu `options.multiResolution` là true, xử lý nhiều độ phân giải
    if (options.multiResolution) {
        const resolutions = [
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
            { name: '480p', width: 854, height: 480, bitrate: '1400k' },
            { name: '240p', width: 426, height: 240, bitrate: '500k' },
        ];

        let completed = 0; // Đếm số lần hoàn thành
        let errors = []; // Lưu lỗi nếu có
        const playlistEntries = []; // Danh sách các entry cho playlist master

        resolutions.forEach((res) => {
            const resolutionOutput = `${baseOutputPath}_${res.name}`;
            ffmpeg(inputPath)
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

                    // Thêm entry vào playlist master
                    playlistEntries.push(
                        `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate, 10) * 1000},RESOLUTION=${res.width}x${res.height}\n${path.basename(resolutionOutput)}.m3u8`,
                    );

                    completed++;
                    if (completed === resolutions.length) {
                        // Tạo playlist master
                        const masterPlaylistContent = `#EXTM3U\n${playlistEntries.join('\n')}\n`;
                        fs.writeFileSync(`${baseOutputPath}_master.m3u8`, masterPlaylistContent);

                        callback(errors.length > 0 ? errors : null, 'All resolutions converted successfully');
                    }
                })
                .on('error', (err) => {
                    console.error(`Error during conversion for ${res.name}:`, err);
                    errors.push(err);
                    completed++;
                    if (completed === resolutions.length) {
                        // Tạo playlist master ngay cả khi có lỗi
                        if (playlistEntries.length > 0) {
                            const masterPlaylistContent = `#EXTM3U\n${playlistEntries.join('\n')}\n`;
                            fs.writeFileSync(`${baseOutputPath}_master.m3u8`, masterPlaylistContent);
                        }

                        callback(errors, null);
                    }
                })
                .run();
        });
    } else {
        // Xử lý chuyển đổi bình thường
        ffmpeg(inputPath)
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
                callback(null, 'Conversion successful');
            })
            .on('error', (err) => {
                console.error('Error during conversion:', err);
                callback(err);
            })
            .run();
    }
}

function convertTrailerToHLS(movieId) {
    return new Promise((resolve, reject) => {
        const inputPath = path.join(__dirname, '..', 'storage', 'videos', 'trailers', `${movieId}.mp4`);
        const outputPath = path.join(__dirname, '..', 'storage', 'hls', 'trailers', movieId, `${movieId}.m3u8`);
        convertToHLS(inputPath, outputPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function convertMediaToHLS(mediaId) {
    return new Promise((resolve, reject) => {
        const inputPath = path.join(__dirname, '..', 'storage', 'videos', 'medias', `${mediaId}.mp4`);
        const outputPath = path.join(__dirname, '..', 'storage', 'hls', 'medias', mediaId, `${mediaId}.m3u8`);
        convertToHLS(
            inputPath,
            outputPath,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            },
            { multiResolution: true },
        );
    });
}

module.exports = { convertToHLS, convertTrailerToHLS, convertMediaToHLS };
