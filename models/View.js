const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const viewSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    date: { type: Date, required: true },
    count: { type: Number, default: 0 },
});

viewSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('View', viewSchema);
