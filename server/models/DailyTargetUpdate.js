const mongoose = require('mongoose');
const DailyTargetUpdateItemSchema = require('./DailyTargetUpdateItem').DailyTargetUpdateItemSchema;

const DailyTargetUpdateSchema = new mongoose.Schema({
    targetUpdates: [DailyTargetUpdateItemSchema],
    date:{
        type: String,
        required: true
    }
});

const DailyTargetUpdateModel = mongoose.model("dailyTargetUpdates", DailyTargetUpdateSchema);

exports.DailyTargetUpdateSchema = DailyTargetUpdateSchema;
exports.DailyTargetUpdateModel = DailyTargetUpdateModel;