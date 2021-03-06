const mongoose = require('mongoose');
const GroupSchema = require('./Group').GroupSchema;

const TeacherSchema = new mongoose.Schema({
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
    },
    firstTimeLoggedIn: {
      type: Boolean,
      default: true
    }
});

const TeacherModel = mongoose.model("teachers", TeacherSchema);

exports.TeacherSchema = TeacherSchema;
exports.TeacherModel = TeacherModel;