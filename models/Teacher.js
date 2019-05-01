const mongoose = require('mongoose');
const GroupSchema = require('./Group').GroupSchema;

const TeacherSchema = new mongoose.Schema({
    teacherId: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    groups: [GroupSchema]
});

const TeacherModel = mongoose.model("teachers", TeacherSchema);

exports.TeacherSchema = TeacherSchema;
exports.TeacherModel = TeacherModel;