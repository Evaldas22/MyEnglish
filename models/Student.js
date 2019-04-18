const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    messengerId: {
        type: String,
        required: true
    },
    englishLevel: {
        type: String,
        required: true
    },
    lessonRating: {
        type: Number,
        required: true
    },
    newWords: {
        type: Array,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    learnedToday: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

var StudentModule = mongoose.model('students', StudentSchema);

module.exports = StudentModule;