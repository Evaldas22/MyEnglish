const mongoose = require('mongoose');

const DailyTargetSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    listOfTargets: [String]
});

const DailyTargetModel = mongoose.model("dailyTargets", DailyTargetSchema);

exports.DailyTargetSchema = DailyTargetSchema;
exports.DailyTargetModel = DailyTargetModel;