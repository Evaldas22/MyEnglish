const mongoose = require('mongoose');

// Score will mark how many times student knew this word
// +1 for knowing
// -1 for not knowing
const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

const WordModel = mongoose.model("words", WordSchema);

exports.WordSchema = WordSchema;
exports.WordModel = WordModel;