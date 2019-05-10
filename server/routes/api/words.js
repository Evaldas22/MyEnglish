const express = require('express');
const router = express.Router();
const getStudent = require('./students').getStudent;
var _ = require('lodash');
var unirest = require('unirest');
var apiKey = process.env.apiKey;
const url = require('url');
const logger = require('../../logging/logger');

var GroupModel = require('../../models/Group').GroupModel;
const WordModel = require('../../models/Word').WordModel;

// @route   GET api/word/{messengerId}{groupName}
// @desc    Get one word for revision
// @access  Public
router.get('/word', (req, res) => {
	const query = url.parse(req.url, true).query;
	const messengerId = query['messenger user id'];
	const groupName = query['groupName'];
	logger.info(`GET api/word for  ${messengerId}`);

	GroupModel.findOne({ groupName: groupName }).then(group => {
		const student = getStudent(group, messengerId);

		if (!student) {
			logger.error(`student with ${messengerId} not found`);
			return res.status(500).json('Student not found');
		}
		else if (student.knownWords.length <= 0) {
			logger.error(`student with ${messengerId} doesn't have any knownWords`);
			return res.status(404).json("Student doesn't know any words");
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
	const knowIt = query['knowIt'];

	const messengerId = req.body['messenger user id'];
	const groupName = req.body.groupName;
	const word = req.body.revisionWord;

	logger.info(`POST api/word/update for ${messengerId}[${groupName}] word - ${word}`);

	GroupModel.findOne({ groupName: groupName }).then(group => {

		if (_.isUndefined(group)) {
			logger.error(`group - ${group} does not exist`);
			return res.status(404).json('Group not found');
		}

		const student = getStudent(group, messengerId);

		if (_.isUndefined(student)) {
			logger.error(`student - ${messengerId} does not exist`);
			return res.status(500).json('Student not found');
		}
		else if (student.knownWords.length <= 0) {
			logger.error(`student - ${messengerId} does not have any known words`);
			return res.status(404).json("Student doesn't know any words");
		}

		student.knownWords.forEach(knownWord => {
			if (knownWord.word === word) {
				knownWord.score += (knowIt === "true") ? 1 : 0;
			}
		});

		group.save(err => {
			if (err) {
				logger.error(`Error saving student(${messengerId}[${groupName}]) data`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(student);
		});
	})
});

// @route   POST api/word/newWords/{messengerId}{groupName}{newWords}
// @desc    Add new words for the student
// @access  Public
router.post('/word/newWords', (req, res) => {
	const messengerId = req.body['messenger user id'];
	const groupName = req.body.groupName;
	const newWords = req.body.newWords;

	logger.info(`POST api/word/newWords for ${messengerId}[${groupName}]`);

	GroupModel.findOne({ groupName: groupName }).then(group => {

		if (_.isUndefined(group)) {
			logger.error(`group ${groupName} doesn not exist`);
			return res.status(404).json('Group not found');
		}

		const student = getStudent(group, messengerId);
		if (_.isUndefined(student)) {
			logger.error(`student ${messengerId} doesn not exist`);
			return res.status(404).json('Student not found');
		}

		const newWordsToBeAdded = getNewWordsWithTranslation(student.knownWords, getWordsWithTranslationArrayFromString(newWords));
		student.knownWords.push.apply(student.knownWords, newWordsToBeAdded);

		group.save(err => {
			if (err) {
				logger.error(`Error saving student(${messengerId}[${groupName}]) data`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(student);
		});
	})
});

// TODO: maybe remove

// // @route   GET api/word/definition/{word}
// // @desc    Get a definition of a word
// // @access  Public
// router.get('/word/definition', (req, res) => {
// 	const query = url.parse(req.url, true).query;
// 	const word = query['revisionWord'];

// 	logger.info(`GET api/word/definition for ${word}`);

// 	unirest.get(`https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`)
// 		.header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
// 		.header("X-RapidAPI-Key", apiKey)
// 		.end(function (result) {
// 			res.json(constructDefinitionResponse(result.body));
// 		});
// });

// TODO: maybe remove

// // @route   GET api/word/example/{word}{numberOfWord}
// // @desc    Get example/-s of word
// // @access  Public
// router.get('/word/example', (req, res) => {
// 	const query = url.parse(req.url, true).query;
// 	const word = query['revisionWord'];
// 	const numberOfWord = query['numberOfWord']

// 	logger.info(`GET api/word/example for ${word} number ${numberOfWord}`);

// 	unirest.get(`https://wordsapiv1.p.rapidapi.com/words/${word}/examples`)
// 		.header("X-RapidAPI-Host", "wordsapiv1.p.rapidapi.com")
// 		.header("X-RapidAPI-Key", apiKey)
// 		.end(function (result) {
// 			res.json(constructExampleResponse(result.body, numberOfWord));
// 		});
// });

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

// TODO: possible remove

// const constructDefinitionResponse = definitionsObj => {
// 	if (_.isEmpty(definitionsObj.definitions)) {
// 		return { "messages": [{ "text": "We couldn't find any definition for this word :/" }] };
// 	}
// 	else {
// 		const differentDefinitionsObjs = [];

// 		definitionsObj.definitions.forEach(definition => {
// 			if (!partOfSpeechExists(differentDefinitionsObjs, definition.partOfSpeech)) {
// 				differentDefinitionsObjs.push(definition);
// 			}
// 		});

// 		const textMessages = differentDefinitionsObjs.map(definitionObj => {
// 			if (_.isNull(definitionObj.partOfSpeech)) {
// 				return {
// 					"text": `${definitionsObj.word} - ${definitionObj.definition}`
// 				}
// 			}
// 			else return {
// 				"text": `${definitionsObj.word} (${definitionObj.partOfSpeech}) - ${definitionObj.definition}`
// 			}
// 		});

// 		return { "messages": textMessages };
// 	}
// }

// const constructExampleResponse = (exampleObj, exampleNumber) => {
// 	if (_.isEmpty(exampleObj.examples)) {
// 		return { "messages": [{ "text": "We couldn't find any examples for this word :/" }] };
// 	}
// 	else {
// 		if (exampleNumber > exampleObj.examples.length) {
// 			return { "messages": [{ "text": "Sorry, but I don't have any examples left..." }] }
// 		}
// 		else {
// 			const example = exampleObj.examples[exampleNumber - 1];
// 			return { "messages": [{ "text": example }] };
// 		}
// 	}
// }

// const partOfSpeechExists = (differentDefinitionsObjs, partOfSpeech) => {
// 	let containsPartOfSpeech = false;

// 	differentDefinitionsObjs.forEach(definitionObj => {
// 		if (definitionObj.partOfSpeech === partOfSpeech) {
// 			containsPartOfSpeech = true;
// 		}
// 	});

// 	return containsPartOfSpeech;
// }

const getWordsWithTranslationArrayFromString = (wordsString) => {
	return wordsString.split(/,\s*/);
}

const getNewWordsWithTranslation = (knownWords, newWordsWithTranslationArr) => {
	const newWordsToBeAdded = [];

	newWordsWithTranslationArr.map(newWordWithTranslation => {
		const newWord = getWordOrTranslation(newWordWithTranslation, true);
		const newWordTranslation = getWordOrTranslation(newWordWithTranslation, false);

		// if we have translation 
		if (!_.isUndefined(newWordTranslation)) {
			// only add that new word if it doesn't already exist in DB and in new words array (we don't want duplicates)
			if (!alreadyExisitsInCollection(knownWords, newWord) && !alreadyExisitsInCollection(newWordsToBeAdded, newWord)) {
				newWordsToBeAdded.push(new WordModel({
					word: newWord,
					score: 0,
					translation: newWordTranslation
				}));
			}
		}
		else {
			// check google translate API for it
			const translationFromAPI = "TRANSLATION";

			if (translationFromAPI) {
				if (!alreadyExisitsInCollection(knownWords, newWord) && !alreadyExisitsInCollection(newWordsToBeAdded, newWord)) {
					newWordsToBeAdded.push(new WordModel({
						word: newWord,
						score: 0,
						translation: translationFromAPI
					}));
				}
			}
		}
	})

	return newWordsToBeAdded;
}

const getWordOrTranslation = (wordWithTranslation, returnWord) => {
	const pair = wordWithTranslation.split(/\s*-\s*/);

	if (returnWord) {
		return pair[0];
	}
	if (pair.length > 1) {
		return pair[1];
	}

	return undefined;
}

// collection - it needs to be an array of our Word Models
const alreadyExisitsInCollection = (collection, word) => {
	return collection.filter(knownWord => (knownWord.word === word)).length > 0;
}

module.exports = router;