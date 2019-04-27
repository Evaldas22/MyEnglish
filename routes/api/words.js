const express = require('express');
const router = express.Router();
const getStudent = require('./students').getStudent;
const getGroup = require('./students').getGroup;
const getNewWords = require('./students').getNewWords;
const getWordsArrayFromString = require('./students').getWordsArrayFromString;
var _ = require('lodash');
var unirest = require('unirest');
var apiKey = process.env.apiKey;
const url = require('url');


var GroupModel = require('../../models/Group');

// @route   GET api/word/{messengerId}
// @desc    Get one word for revision
// @access  Public
router.get('/word', (req, res) => {
	const query = url.parse(req.url, true).query;
	const messengerId = query['messenger user id'];
	
	GroupModel.find()
		.then(groups => {
			const student = getStudent(groups, messengerId);
		
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
	const query = url.parse(req.url, true).query;
	const messengerId = query['messenger user id'];
	const groupName = query['groupName'];
	const word = query['revisionWord'];
	const knowIt = query['knowIt'];
	console.log(`${messengerId} ${groupName} ${word} ${knowIt}`);

	GroupModel.find()
		.then(groups => {
			const group = getGroup(groups, groupName);
			if (_.isUndefined(group)) {
				res.status(404).json('Group not found');
			}
			const student = getStudent(groups, messengerId);

			if (_.isUndefined(student)) {
				res.status(500).json('Student not found');
			}
			else if (student.knownWords.length <= 0) {
				res.status(404).json("Student doesn't know any words");
			}

			student.knownWords.forEach(knownWord => {
				if (knownWord.word === word) {
					knownWord.score += (knowIt === "true") ? 1 : 0;
				}
			}); 

			group.save(err => {
				if (err) return res.status(500).json(err);
				res.json(student);
			});
		})
});

// @route   POST api/word/newWords/{messengerId}{groupName}{newWords}
// @desc    Add new words for the student
// @access  Public
router.post('/word/newWords', (req, res) => {
	const query = url.parse(req.url, true).query;
	const messengerId = query['messenger user id'];
	const groupName = query['groupName'];
	const newWords = query['newWords'];

	GroupModel.find()
		.then(groups => {
			const group = getGroup(groups, groupName);
			if (_.isUndefined(group)) {
				res.status(404).json('Group not found');
			}
			const student = getStudent(groups, messengerId);

			if (_.isUndefined(student)) {
				res.status(404).json('Student not found');
			} 

			const newWordsToBeAdded = getNewWords(student.knownWords, getWordsArrayFromString(newWords));
			student.knownWords.push.apply(student.knownWords, newWordsToBeAdded);

			group.save(err => {
				if (err) return res.status(500).json(err);
				res.json(student);
			});
		})
});

// @route   GET api/word/definition/{word}
// @desc    Get a definition of a word
// @access  Public
router.get('/word/definition', (req, res) => {
	const query = url.parse(req.url, true).query;
	const word = query['revisionWord'];

	unirest.get(`https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`)
		.header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
		.header("X-RapidAPI-Key", apiKey)
		.end(function (result) {
			res.json(constructDefinitionResponse(result.body));
		});
});

// @route   GET api/word/example/{word}
// @desc    Get example/-s of word
// @access  Public
router.get('/word/example', (req, res) => {
	const query = url.parse(req.url, true).query;
	const word = query['revisionWord'];

	unirest.get(`https://wordsapiv1.p.rapidapi.com/words/${word}/examples`)
		.header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
		.header("X-RapidAPI-Key", apiKey)
		.end(function (result) {
			res.json(constructExampleResponse(result.body));
		});
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

const constructDefinitionResponse = definitionsObj => {
	if (_.isEmpty(definitionsObj.definitions)) {
		return {
			"messages": [
				{"text": "We couldn't find any definition for this word :/"}
			]
		};
	}
	else {
		const randomNum = Math.floor(Math.random() * definitionsObj.definitions.length);
		const definitionObj = definitionsObj.definitions[randomNum];
		return {
			"messages": [
				{"text": `${definitionsObj.word} (${definitionObj.partOfSpeech}) - ${definitionObj.definition}`}
			]
		};
	}
}

const constructExampleResponse = exampleObj => {
	if (_.isEmpty(exampleObj.examples)) {
		return {
			"messages": [
				{"text": "We couldn't find any examples for this word :/"}
			]
		};
	}
	else {
		const randomNum = Math.floor(Math.random() * exampleObj.examples.length);
		const example = exampleObj.examples[randomNum];
		return {
			"messages": [
				{"text": example}
			]
		};
	}
}

module.exports = router;