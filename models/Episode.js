const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const episodeSchema = new Schema({
    movie: { type: Schema.Types.ObjectId, ref: 'Movie' },
    description: { type: String },
    episodeNumber: { type: Number },
    mediaId: { type: String },
    duration: { type: String },
    thumbnailUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

episodeSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('Episode', episodeSchema);
