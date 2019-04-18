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

// @route   GET api/students/words
// @desc    Get all words that student have learned
// @access  Public
router.get('/words', (req, res) => {
    StudentModel.find({messengerId: req.query.messengerId})
    .then(matches => {
        const words = getWordsArrayForStudent(matches);
        res.json(words);
    });
});

// @route   POST api/students
// @desc    Add student data
// @access  Public
router.post('/', (req, res) => {

    const newStudentData = new StudentModel({
        messengerId: req.query.messengerId || null,
        englishLevel: req.query.englishLevel || null,
        lessonRating: req.query.lessonRating || 0,
        newWords: getWordsArrayFromString(req.query.newWords),
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

const getWordsArrayFromString = (wordsString) => {
    return wordsString.split(/[\s,]+/);
}

const getWordsArrayForStudent = (matchingDocuments) => {
    const words = [];
    matchingDocuments.forEach(document => {
        words.push.apply(words, document.newWords)
    });

    return words;
}

module.exports = router;