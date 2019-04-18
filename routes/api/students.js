const express = require('express');
const router = express.Router();

var StudentModel = require('../../models/Student');

// @route   GET api/students
// @desc    Get all student info
// @access  Public
router.get('/', (req, res) => {
    StudentModel.find()
        .sort({date: -1})
        .then(students => res.json(students))
});

// @route   POST api/students
// @desc    Add student data
// @access  Public
router.post('/', (req, res) => {

    const newStudentData = new StudentModel({
        messengerId: req.query.messengerId || null,
        englishLevel: req.query.englishLevel || null,
        lessonRating: req.query.lessonRating || 0,
        newWords: getWordsArray(req.query.newWords),
        groupName: req.query.groupName || '',
        learnedToday: getLearnedToday(req.query.learnedToday, req.query.learnedTodayExtended)
    })

    // res.json(newStudentData);

    StudentModel.create(newStudentData)
        .then(savedStudentData => res.json(savedStudentData))
        .catch(err => res.status(500).json(err));
});

const getLearnedToday = (learnedToday, extension) => {
    return learnedToday + (extension ? (". " + extension) : "")
}

const getWordsArray = (wordsString) => {
    return wordsString.split(/[\s,]+/);
}

module.exports = router;