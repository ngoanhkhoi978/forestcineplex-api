const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const genreSchema = new mongoose.Schema({
    description: { type: String, required: true },
});

genreSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('Genre', genreSchema);
