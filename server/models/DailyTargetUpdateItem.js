const mongoose = require('mongoose');

const DailyTargetUpdateItemSchema = new mongoose.Schema({
  target: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
});

const DailyTargetUpdateItemModel = mongoose.model("dailyTargetUpdateItems", DailyTargetUpdateItemSchema);

exports.DailyTargetUpdateItemSchema = DailyTargetUpdateItemSchema;
exports.DailyTargetUpdateItemModel = DailyTargetUpdateItemModel;
