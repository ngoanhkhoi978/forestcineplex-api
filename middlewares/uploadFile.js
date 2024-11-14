const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        let newFileName = '';
        if (req.body.type === 'movie') {
            if (file.fieldname === 'coverFile') {
                newFileName = `cover-${req.movieId}`;
                req.coverFile = newFileName + path.extname(file.originalname);
            } else if (file.fieldname === 'thumbnailFile') {
                newFileName = `thumbnail-${req.movieId}`;
                req.thumbnailFile = newFileName + path.extname(file.originalname);
            } else if (file.fieldname === 'trailerFile') {
                newFileName = `${req.movieId}`;
                req.trailerFile = newFileName + path.extname(file.originalname);
            }
        }
        cb(null, newFileName + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
