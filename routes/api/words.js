const express = require('express');
const router = express.Router();
const getStudent = require('./students').getStudent;
var _ = require('lodash');

var GroupModel = require('../../models/Group');

// @route   GET api/word/{messengerId}
// @desc    Get one word for revision
// @access  Public
router.get('/word', (req, res) => {
    GroupModel.find()
        .then(groups => {
            const student = getStudent(groups, req.query.messengerId);
            
            if (!student) {
                res.status(500).json('Student not found');
            }

            const wordForRevision = getWordForRevision(student.knownWords);
            if (_.isNull(wordForRevision)) {
                res.status(404).json('This student probably has no words');
            }
            res.json(wordForRevision);
        })
});

// This function should take a word with lowest score or if there are multiple such words
// with lowest score, then pick random word from those with lowest score
const getWordForRevision = words => {
    let smallestScoreWord = {};

    // get the smallest score word
    words.forEach(word => {
        if (_.isEmpty(smallestScoreWord) || (words.score < smallestScoreWord.score)) {
            smallestScoreWord = word;
        }
    });
    
    if (_.isEmpty(smallestScoreWord)) {
        return null;
    }

    // after we got smallest score word, we need to check if we have more words with this score
    const smallestScoreAllWords = getAllWordsWithSmallestScore(words, smallestScoreWord.score);

    if (smallestScoreAllWords.length > 1) {
        return  getRandomWord(smallestScoreAllWords)  ; 
    }
    else {
        smallestScoreWord.word;
    }
}

const getAllWordsWithSmallestScore = (words, score) => {
    let wordsWithSameScore = [];
    words.forEach(word => {
        if (word.score === score) {
            wordsWithSameScore.push(word.word);
        }
    });

    return wordsWithSameScore;
}

function getRandomWord(words) {
    const randomNum = Math.floor(Math.random() * words.length);
    return words[randomNum];
}

module.exports = router;