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

// @route   GET api/students/revision
// @desc    Get specified number of random words for revision for one student
// @access  Public
router.get('/revision', (req, res) => {
    const NUMBER_OF_WORDS = 5;
    StudentModel.find({messengerId: req.query.messengerId})
    .then(matches => {
        const allWords = getWordsArrayForStudent(matches);
        const wordsForRevision = getRandomWordsForRevision(allWords, NUMBER_OF_WORDS);
        res.json(wordsForRevision);
    });
});

// @route   POST api/students
// @desc    Add student data
// @access  Public
router.post('/', (req, res) => {
    let newWords = getWordsArrayFromString(req.query.newWords);
    // remove duplicates
    newWords = [...new Set(newWords)];

    // make sure not to add words that are already saved in DB
    StudentModel.find({messengerId: req.query.messengerId})
    .then(matches => {
        const allWords = getWordsArrayForStudent(matches);

        const filteredWords = newWords.filter(newWord => (!allWords.includes(newWord)));
        
        const newStudentData = new StudentModel({
            messengerId: req.query.messengerId || null,
            englishLevel: req.query.englishLevel || null,
            lessonRating: req.query.lessonRating || 0,
            newWords: filteredWords,
            groupName: req.query.groupName || '',
            learnedToday: getLearnedToday(req.query.learnedToday, req.query.learnedTodayExtended)
        })
    
        // res.json(newStudentData);
    
        StudentModel.create(newStudentData)
            .then(savedStudentData => res.json(savedStudentData))
            .catch(err => res.status(500).json(err));
    });
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

function getRandomWordsForRevision(wordsArr, n) {
    const result = [];
    const len = wordsArr.length;
    const takenWords = [];
    
    while(n > 0){
      const rand = Math.floor(Math.random() * len);
      const wordToBeTaken = wordsArr[rand];
      if(takenWords.includes(wordToBeTaken)){
      	continue;
      } else {
      	result.push(wordToBeTaken);
        takenWords.push(wordToBeTaken);
      }
      n--;
    }
		
    return result;
}

module.exports = router;