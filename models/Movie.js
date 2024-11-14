const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const movieSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
    releaseDate: { type: Date },
    directors: [{ type: String }],
    casts: [{ type: String }],
    thumbnailUrl: { type: String },
    coverImageUrl: { type: String },
    rating: { type: Number, default: 0 },
    countRating: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    ageRestriction: { type: String },
    episodes: [{ type: Schema.Types.ObjectId, ref: 'Episode' }],
    isSeries: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    trailerUrl: { type: String },
});

movieSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('Movie', movieSchema);
