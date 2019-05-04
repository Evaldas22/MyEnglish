const mongoose = require('mongoose');
const GroupSchema = require('./Group').GroupSchema;

const TeacherSchema = new mongoose.Schema({
    teacherId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'teacher']
    },
    groups: [GroupSchema],
    dateCreated: {
      type: Date,
      default: Date.now
    }
});

const TeacherModel = mongoose.model("teachers", TeacherSchema);

exports.TeacherSchema = TeacherSchema;
exports.TeacherModel = TeacherModel;