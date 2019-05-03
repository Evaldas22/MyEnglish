const mongoose = require('mongoose');
const DailyTargetUpdateSchema = require('./DailyTargetUpdate').DailyTargetUpdateSchema;

const DayUpdateSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    learnedToday: {
        type: String,
        required: true
    },
    lessonRating: {
        type: Number,
        required: true
    },
    lessonRatingExplanation: {
        type: String
    },
    newWords: {
        type: Array,
        required: true
    }
});

const DayUpdateModel = mongoose.model("dayUpdates", DayUpdateSchema);

exports.DayUpdateSchema = DayUpdateSchema;
exports.DayUpdateModel = DayUpdateModel;