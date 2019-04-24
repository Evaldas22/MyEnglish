const express = require('express');
const router = express.Router();

var GroupModel = require('../../models/Group');
var StudentModel = require('../../models/Student').StudentModel;
var DayUpdateModel = require('../../models/DayUpdate').DayUpdateModel;
var WordModel = require('../../models/Word').WordModel;

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', (req, res) => {
    GroupModel.find()
        .then(group => res.json(group))
});

// @route   GET api/group/{groupName}
// @desc    Get all students for certain group
// @access  Public
router.get('/group', (req, res) => {
    GroupModel.find({ name: req.query.groupName })
        .then(group => res.json(group))
});

// // @route   GET api/students/words
// // @desc    Get all words that student have learned
// // @access  Public
// router.get('/words', (req, res) => {
//     StudentModel.find({messengerId: req.query.messengerId})
//     .then(matches => {
//         const words = getWordsArrayForStudent(matches);
//         res.json(words);
//     });
// });

// // @route   GET api/students/revision
// // @desc    Get specified number of random words for revision for one student
// // @access  Public
// router.get('/revision', (req, res) => {
//     const NUMBER_OF_WORDS = 5;
//     StudentModel.find({messengerId: req.query.messengerId})
//     .then(matches => {
//         const allWords = getWordsArrayForStudent(matches);
//         const wordsForRevision = getRandomWordsForRevision(allWords, NUMBER_OF_WORDS);
//         res.json(wordsForRevision);
//     });
// });

// @route   POST api/student
// @desc    Add student day update
// @access  Public
router.post('/student', (req, res) => {

    const {
        messengerId, 
        englishLevel, 
        lessonRating,
        lessonRatingExplanation,
        newWords,
        groupName,
        learnedToday,
        learnedTodayExtended,
        firstName,
        lastName
    } = req.query;

    GroupModel.find().then(groups => {
        const group = getGroup(groups, groupName);

        // if this is new group
        if (!group) {
            const newStudent = constructNewStudent(req.query);
            const newGroup = new GroupModel({
                groupName: groupName,
                students: [newStudent]
            });
    
            GroupModel.create(newGroup)
                .then(saveGroupData => res.json(saveGroupData))
                .catch(err => res.status(500).json(err));
        }
        else{
            const student = getStudent(groups, messengerId);

            // if this is new student
            if (!student) {
                const newStudent = constructNewStudent(req.query);
                group.students.push(newStudent);
                
                group.save(err => {
                    if (err) return res.status(500).json(err);
                    res.json(newStudent);
                });
            }
            else{
                // Need to update knownWords and dayUpdates
                const newDayUpdate = constructDayUpdate(req.query);
                const newWordsToBeAdded = getNewWords(student.knownWords, getWordsArrayFromString(newWords));
                
                student.dayUpdates.push(newDayUpdate);
                student.knownWords.push.apply(student.knownWords, newWordsToBeAdded);

                group.save(err => {
                    if (err) return res.status(500).json(err);
                    res.json(student);
                });
            }
        }
    })






    // let newWords = getWordsArrayFromString(req.query.newWords);
    // // remove duplicates
    // newWords = [...new Set(newWords)];

    // // make sure not to add words that are already saved in DB
    // StudentModel.find({messengerId: req.query.messengerId})
    // .then(matches => {
    //     const allWords = getWordsArrayForStudent(matches);

    //     const filteredWords = newWords.filter(newWord => (!allWords.includes(newWord)));
        
    //     const newStudentData = new StudentModel({
    //         messengerId: req.query.messengerId || null,
    //         englishLevel: req.query.englishLevel || null,
    //         lessonRating: req.query.lessonRating || 0,
    //         newWords: filteredWords,
    //         groupName: req.query.groupName || '',
    //         learnedToday: getLearnedToday(req.query.learnedToday, req.query.learnedTodayExtended)
    //     })
    
    //     // res.json(newStudentData);
    
    //     StudentModel.create(newStudentData)
    //         .then(savedStudentData => res.json(savedStudentData))
    //         .catch(err => res.status(500).json(err));
    // });
});

const getNewWords = (knownWords, newWordsArr) => {
    const newUniqueWords = [...new Set(newWordsArr)];
    let newWordsToBeAdded = [];

    newUniqueWords.forEach(newWord => {
        // only add new word if it's not already in knowWords array
        if (!knownWords.filter(knownWord => ( knownWord.word === newWord )).length > 0) {
            newWordsToBeAdded.push(new WordModel({
                word: newWord,
                score: 0
            }));  
        }
    })

    return newWordsToBeAdded;
}

const constructNewStudent = query => {
    return new StudentModel({
        messengerId: query.messengerId,
        name: query.firstName + " " + query.lastName,
        englishLevel: query.englishLevel,
        groupName: query.groupName,
        knownWords: constructKnownWords(getWordsArrayFromString(query.newWords)),
        dayUpdates: [constructDayUpdate(query)]
    });
}

const constructDayUpdate = query => {
    const newWordsArray = getWordsArrayFromString(query.newWords);
    const newUniqueWords = [...new Set(newWordsArray)];

    return new DayUpdateModel({
        learnedToday: getLearnedToday(query.learnedToday, query.learnedTodayExtended),
        lessonRating: query.lessonRating || 0,
        lessonRatingExplanation: query.lessonRatingExplanation || "",
        newWords: newUniqueWords
    });
}

const constructKnownWords = words => {
    return words.map(word => {
        return new WordModel({
            word: word,
            score:0
        })
    })
}

const getGroup = (groups, groupName) => {
    let existingGroup;
    groups.forEach(group => {
        if (group.groupName === groupName) {
            existingGroup = group;
            return;
        }
    })
    return existingGroup;
}

const getStudent = (groups, messengerId) => {
    let existingStudent;
    groups.forEach(group => {
        group.students.forEach(student =>{
            if (student.messengerId === messengerId) {
                existingStudent = student;
                return;
            }
        })
    })
    return existingStudent;
}

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