const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const episodeSchema = new Schema({
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie' }, // Liên kết với model Movie
    description: { type: String },
    episodeNumber: { type: Number }, // Số tập của episode
    mediaId: { type: String }, // ID của media file (video)
    duration: { type: String }, // Thời lượng của tập phim
    thumbnailUrl: { type: String }, // Đường dẫn ảnh thumbnail
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
});

episodeSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('Episode', episodeSchema);
