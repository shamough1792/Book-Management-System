const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    cover: String,
    isFavorite: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', bookSchema);
