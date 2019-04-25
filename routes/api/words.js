const express = require('express');
const router = express.Router();
const getStudent = require('./students').getStudent;
const getGroup = require('./students').getGroup;
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
			else if (student.knownWords.length <= 0) {
				res.status(404).json("Student doesn't know any words");
			}

			const wordForRevision = getWordForRevision(student.knownWords);
			
			const response = constructResponse(wordForRevision);

			res.json(response);
		})
});

// @route   POST api/word/update/{messengerId}{groupName}{word}{knowIt}
// @desc    Update word score
// @access  Public
router.post('/word/update', (req, res) => {
	GroupModel.find()
		.then(groups => {
			const group = getGroup(groups, req.query.groupName);
			const student = getStudent(groups, req.query.messengerId);

			if (!student) {
				res.status(500).json('Student not found');
			}
			else if (student.knownWords.length <= 0) {
				res.status(404).json("Student doesn't know any words");
			}

			student.knownWords.forEach(knownWord => {
				if (knownWord.word === req.query.word) {
					knownWord.score += (req.query.knowIt === "true") ? 1 : -1;
				}
			}); 

			group.save(err => {
				if (err) return res.status(500).json(err);
				res.json(student);
			});
		})
});

// This function should take a word with lowest score or if there are multiple such words
// with lowest score, then pick random word from those with lowest score
const getWordForRevision = words => {
	let smallestScoreWordObj = {};

	// get the smallest score word
	words.forEach(word => {
		if (_.isEmpty(smallestScoreWordObj) || (word.score < smallestScoreWordObj.score)) {
			smallestScoreWordObj = word;
		}
	});
	console.log(smallestScoreWordObj);
	// after we got smallest score word, we need to check if we have more words with this score
	const wordsWithSmallestScore = getAllWordsWithSmallestScore(words, smallestScoreWordObj.score);

	if (wordsWithSmallestScore.length > 1) {
		return getRandomWord(wordsWithSmallestScore);
	}
	else {
		return wordsWithSmallestScore[0];
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

const constructResponse = word => {
	return {
		"set_attributes":
			{
				"revisionWord": word
			}
	}
}

module.exports = router;