const mongoose = require('mongoose');
const StudentSchema = require('./Student').StudentSchema;
const DailyTargetSchema = require('./DailyTarget').DailyTargetSchema;

const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    students: [StudentSchema],
    teacherId: {
        type: String,
        required: true,
        default: ""
    },
    dailyTargets: [DailyTargetSchema]
});

var GroupModel = mongoose.model('groups', GroupSchema);

exports.GroupModel = GroupModel;
exports.GroupSchema = GroupSchema;
