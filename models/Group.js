const mongoose = require('mongoose');
const StudentSchema = require('./Student').StudentSchema;

const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    students: [StudentSchema]
});

var GroupModel = mongoose.model('groups', GroupSchema);

module.exports = GroupModel;