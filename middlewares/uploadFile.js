const multer = require('multer');
const path = require('path');
const fs = require('fs');
const deletePath = require('../utils/deletePath');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        if (req.body.type === 'movie') {
            if (file.fieldname === 'coverFile') {
                uploadPath = path.join(__dirname, '..', 'public', 'covers');
            } else if (file.fieldname === 'thumbnailFile') {
                uploadPath = path.join(__dirname, '..', 'public', 'thumbnails');
            } else if (file.fieldname === 'trailerFile') {
                uploadPath = path.join(__dirname, '..', 'protected', 'uploads', 'trailers');
            }
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        (async function asyncfunc() {
            let newFileName = '';
            if (req.body.type === 'movie') {
                if (file.fieldname === 'coverFile') {
                    newFileName = `cover-${req.movieId}`;
                    req.coverFile = newFileName + path.extname(file.originalname);
                    if (req.method === 'PUT') {
                        const coverPath = path.join(__dirname, '..', ...req.movie.coverImageUrl.split('/'));
                        await deletePath(coverPath);
                    }
                } else if (file.fieldname === 'thumbnailFile') {
                    newFileName = `thumbnail-${req.movieId}`;
                    req.thumbnailFile = newFileName + path.extname(file.originalname);
                    if (req.method === 'PUT') {
                        const thumbnailPath = path.join(__dirname, '..', ...req.movie.thumbnailUrl.split('/'));
                        await deletePath(thumbnailPath);
                    }
                } else if (file.fieldname === 'trailerFile') {
                    newFileName = `${req.movieId}`;
                    req.trailerFile = newFileName + path.extname(file.originalname);
                    if (req.method === 'PUT') {
                        const trailerPath = path.join(__dirname, '..', ...req.movie.trailerUrl.split('/').slice(0, -1));
                        await deletePath(trailerPath);
                    }
                }
            }
            cb(null, newFileName + path.extname(file.originalname));
        })().catch((err) => cb(err));
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
