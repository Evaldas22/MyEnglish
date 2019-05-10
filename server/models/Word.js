const mongoose = require('mongoose');

// Score will mark how many times student knew this word
// +1 for knowing
const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    translation: {
        type: String,
        default: ''
    }
});

const WordModel = mongoose.model("words", WordSchema);

exports.WordSchema = WordSchema;
exports.WordModel = WordModel;