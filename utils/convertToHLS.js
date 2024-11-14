const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function convertToHLS(inputPath, outputPath, callback) {
    if (!fs.existsSync(inputPath)) {
        return callback(new Error('Input file does not exist'));
    }

    // Tạo thư mục đầu ra nếu nó chưa tồn tại
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Đảm bảo đường dẫn output không chứa phần mở rộng (để ffmpeg tạo tệp m3u8 và các tệp ts)
    const baseOutputPath = path.join(outputDir, path.basename(inputPath, path.extname(inputPath)));

    // Sử dụng ffmpeg để chuyển đổi video đầu vào thành HLS
    ffmpeg(inputPath)
        .output(`${baseOutputPath}.m3u8`) // Tạo file m3u8
        .audioCodec('aac')
        .videoCodec('libx264')
        .format('hls')
        .outputOptions([
            '-hls_time 10', // Thiết lập độ dài mỗi đoạn HLS (10 giây cho mỗi segment)
            '-hls_list_size 0', // Không giới hạn số lượng đoạn trong playlist
            '-hls_flags delete_segments', // Xóa các đoạn cũ
            '-hls_segment_filename',
            `${baseOutputPath}_%03d.ts`, // Đặt tên cho các tệp .ts
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

function convertTrailerToHLS(movieId) {
    return new Promise((resolve, reject) => {
        const inputPath = path.join(__dirname, '..', 'protected', 'uploads', 'trailers', `${movieId}.mp4`);
        const outputPath = path.join(__dirname, '..', 'public', 'trailers', movieId, `${movieId}.m3u8`);
        convertToHLS(inputPath, outputPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function convertMediaToHLS(mediaId, callback) {
    const inputPath = path.join(__dirname, '..', 'protected', 'uploads', 'medias', `${mediaId}.mp4`);
    const outputPath = path.join(__dirname, '..', 'protected', 'medias', mediaId, `${mediaId}.m3u8`);
    convertToHLS(inputPath, outputPath, callback);
}

module.exports = { convertToHLS, convertTrailerToHLS, convertMediaToHLS };
