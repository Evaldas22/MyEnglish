const mongoose = require('mongoose');
const WordSchema = require('./Word').WordSchema;
const DayUpdateSchema = require('./DayUpdate').DayUpdateSchema;

const StudentSchema = new mongoose.Schema({
    messengerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    englishLevel: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    knownWords: [WordSchema],
    dayUpdates: [DayUpdateSchema]
});

const StudentModel = mongoose.model("students", StudentSchema);

exports.StudentSchema = StudentSchema;
exports.StudentModel = StudentModel;