const mongoose = require('mongoose');

const DailyTargetUpdateSchema = new mongoose.Schema({
    target: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
});

const DailyTargetUpdateModel = mongoose.model("dailyTargetUpdates", DailyTargetUpdateSchema);

exports.DailyTargetUpdateSchema = DailyTargetUpdateSchema;
exports.DailyTargetUpdateModel = DailyTargetUpdateModel;