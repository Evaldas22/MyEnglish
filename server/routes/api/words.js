const express = require('express');
const router = express.Router();
const _ = require('lodash');
const unirest = require('unirest');
const apiKey = process.env.apiKey;
// const apiKey = require('../../config/apiKey').apiKey;
const url = require('url');
const logger = require('../../logging/logger');
const axios = require('axios');

// import required models
const GroupModel = require('../../models/Group').GroupModel;
const WordModel = require('../../models/Word').WordModel;
const RevisionModel = require('../../models/Revision').RevisionModel;
const RevisionWordModel = require('../../models/RevisionWord').RevisionWordModel;

const REVISION_LIMIT = 5;

// @route   GET api/word/
// @desc    Get one word for revision
// @access  Public
router.get('/word', (req, res) => {
	// Get all query parameters
	const query = url.parse(req.url, true).query;
	const messengerId = query['messenger user id'];
	const { groupName, startingRevision } = query;

	logger.info(`GET api/word for  ${messengerId}`);

	GroupModel.findOne({ groupName: groupName }).then(group => {
		if (!group) {
			logger.error(`Group ${groupName} not found`);
			return res.json(400).json(`Group ${groupName} not found`);
		}

		let student = getStudent(group, messengerId);

		if (!student) {
			logger.error(`student with ${messengerId} not found`);
			return res.status(500).json('Student not found');
		}
		else if (student.knownWords.length <= 0) {
			logger.error(`student with ${messengerId} doesn't have any knownWords`);
			return res.status(404).json("Student doesn't know any words");
		}

		let wordAndTranslationForRevision;

		if (startingRevision === 'true') {
			// if we're starting new revision we need to also create new revision object
			const newRevision = new RevisionModel({
				wordsUnderRevision: []
			});

			wordAndTranslationForRevision = getWordWithTranslationForRevision(student.knownWords);
			student = increaseWordFrequency(student, wordAndTranslationForRevision._id);
			student.revisions.push(newRevision);
		}
		else {
			wordAndTranslationForRevision = getWordWithTranslationForRevision(student.knownWords);
			student = increaseWordFrequency(student, wordAndTranslationForRevision._id);
		}

		group.save(err => {
			if (err) {
				logger.error(`Error saving student(${messengerId}[${groupName}]) data`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(constructResponse(wordAndTranslationForRevision));
		});
	})
});

// @route   POST api/word/update/{messengerId}{groupName}{word}{knowIt}
// @desc    Update word score and revision object
// @access  Public
router.post('/word/update', (req, res) => {
	// Collect all required parameters
	const messengerId = req.body['messenger user id'];
	const { groupName, revisionWord, translation, guess, shouldAskEnglish } = req.body;

	logger.info(`POST api/word/update for ${messengerId}[${groupName}] word - ${revisionWord}`);

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

		// Update known word score
		student.knownWords.forEach(knownWord => {
			if (knownWord.word.toLowerCase() === revisionWord.toLowerCase() && guess.toLowerCase() === revisionWord.toLowerCase()) {
				knownWord.score++;
			}
		});

		// Update revision object (should be last object in array)
		const latestRevision = student.revisions[student.revisions.length - 1];
		// first add word to list
		latestRevision.wordsUnderRevision.push(new RevisionWordModel({
			word: revisionWord.toLowerCase(),
			translation: translation.toLowerCase(),
			guess: guess.toLowerCase(),
			shouldAskEnglish: shouldAskEnglish === "true"
		}))
		// then update revision score
		if (guess.toLowerCase() === revisionWord.toLowerCase() || guess.toLowerCase() == translation.toLowerCase()) {
			latestRevision.score++;
		}

		// save changes and send a response
		group.save(err => {
			if (err) {
				logger.error(`Error saving student(${messengerId}[${groupName}]) data`);
				logger.error(err);
				return res.status(500).json(err);
			}

			// check if we reached the limit of revision words
			if (latestRevision.wordsUnderRevision.length >= REVISION_LIMIT) {
				// send chat fuel formatted answer with score
				res.json(constructRevisionSummary(latestRevision));
			}
			else {
				// simply send back student
				res.json(student);
			}

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

		getNewWordsWithTranslation(student.knownWords, getWordsWithTranslationArrayFromString(newWords))
			.then(newWordsToBeAdded => {
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
	})
});

// This function should take a word with lowest score or if there are multiple such words
// with lowest score, then pick random word from those with lowest score
const getWordWithTranslationForRevision = words => {
	let smallestScoreWordObj = {};

	// get the smallest score word
	// score = score + frequency
	words.forEach(word => {
		if (_.isEmpty(smallestScoreWordObj)
			|| ((word.score + word.frequency) < (smallestScoreWordObj.score + smallestScoreWordObj.frequency))) {
			smallestScoreWordObj = word;
		}
	});

	// after we got smallest score word, we need to check if we have more words with this score
	const totalScore = smallestScoreWordObj.score + smallestScoreWordObj.frequency;
	const wordsWithSmallestTotalScore = getAllWordsWithSmallestScore(words, totalScore);

	if (wordsWithSmallestTotalScore.length > 1) {
		return getRandomWord(wordsWithSmallestTotalScore);
	}
	else {
		return wordsWithSmallestTotalScore[0];
	}
}

const getAllWordsWithSmallestScore = (words, totalScore) => {
	let wordsWithSameScore = [];
	words.forEach(word => {
		if ((word.score + word.frequency) === totalScore) {
			wordsWithSameScore.push(word);
		}
	});

	return wordsWithSameScore;
}

function getRandomWord(words) {
	const randomNum = Math.floor(Math.random() * words.length);
	return words[randomNum];
}

const constructResponse = wordWithTranslation => {
	// choose randomly if ask for lithuanian or english word
	const shouldAskEnglish = (Math.floor(Math.random() * 2) == 0);

	return {
		set_attributes:
		{
			revisionWord: wordWithTranslation.word,
			translation: wordWithTranslation.translation,
			shouldAskEnglish
		}
	};
}

const getWordsWithTranslationArrayFromString = (wordsString) => {
	return wordsString.split(/,\s*/);
}

const getNewWordsWithTranslation = (knownWords, newWordsWithTranslationArr) => {
	const newWordsToBeAdded = [];
	let promises = []

	newWordsWithTranslationArr.forEach(newWordWithTranslation => {
		const newWord = getWordOrTranslation(newWordWithTranslation, true);
		const newWordTranslation = getWordOrTranslation(newWordWithTranslation, false);

		// if we have translation 
		if (!_.isUndefined(newWordTranslation)) {
			// only add that new word if it doesn't already exist in DB and in new words array (we don't want duplicates)
			if (!alreadyExisitsInCollection(knownWords, newWord) && !alreadyExisitsInCollection(newWordsToBeAdded, newWord)) {
				newWordsToBeAdded.push(new WordModel({
					word: newWord.toLowerCase(),
					score: 0,
					frequency: 0,
					translation: newWordTranslation.toLowerCase()
				}));
			}
		}
		else {
			// check google translate API for it
			promises.push(getTranslation(newWord)
				.then(translationFromAPI => {
					if (translationFromAPI) {
						if (!alreadyExisitsInCollection(knownWords, newWord) && !alreadyExisitsInCollection(newWordsToBeAdded, newWord)) {
							newWordsToBeAdded.push(new WordModel({
								word: newWord.toLowerCase(),
								score: 0,
								frequency: 0,
								translation: translationFromAPI.toLowerCase()
							}));
						}
					}
				}));
		}
	})

	return Promise.all(promises)
		.then(() => {
			return newWordsToBeAdded;
		})
}

const getWordOrTranslation = (wordWithTranslation, returnWord) => {
	const pair = wordWithTranslation.split(/\s*-\s*/);

	if (returnWord) {
		return pair[0].toLowerCase();
	}
	if (pair.length > 1) {
		return pair[1].toLowerCase();
	}

	return undefined;
}

// collection - it needs to be an array of our Word Models
const alreadyExisitsInCollection = (collection, word) => {
	return collection.filter(knownWord => (knownWord.word === word)).length > 0;
}

// move this function to this module, to avoid circular dependency
const getStudent = (group, messengerId) => {
	let existingStudent;
	group.students.forEach(student => {
		if (student.messengerId === messengerId) {
			existingStudent = student;
			return;
		}
	})
	return existingStudent;
}

const increaseWordFrequency = (student, wordId) => {
	student.knownWords.forEach(knownWord => {
		if (knownWord._id === wordId) {
			knownWord.frequency++;
			return;
		}
	})
	return student;
}

const constructRevisionSummary = revisionObj => {
	const reportMessages = getReportMessages(revisionObj.wordsUnderRevision)
	return {
		messages: [...reportMessages, {
			text: `Total score: ${revisionObj.score} out of ${REVISION_LIMIT}`
		}],
		redirect_to_blocks: ["Revision end"]
	}
}

const getReportMessages = wordsUnderRevision => {
	return wordsUnderRevision.map(wordUnderRevision => {
		const { word, translation, guess, shouldAskEnglish } = wordUnderRevision
		if (guess === word) {
			return {
				text: `${translation} -> ${word} ✅`
			}
		}
		else if (guess === translation) {
			return {
				text: `${word} -> ${translation} ✅`
			}
		}
		else {
			return {
				text: shouldAskEnglish ? 
				`${word} -> ${guess} ❌. Correct is ${translation}` :
				`${translation} -> ${guess} ❌. Correct is ${word}` 
			}
		}
	})
}

function getTranslation(word) {
	// The target language
	const target = 'lt';

	return axios
		.get(`https://translation.googleapis.com/language/translate/v2?q=${word}&target=${target}&source=en&key=${apiKey}`)
		.then(response => {
			const translations = response.data.data.translations;
			if (translations.length > 0) {
				return translations[0].translatedText;
			}
			else return undefined;
		});
}

exports.router = router;
exports.getWordsWithTranslationArrayFromString = getWordsWithTranslationArrayFromString;
exports.getWordOrTranslation = getWordOrTranslation;
exports.getNewWordsWithTranslation = getNewWordsWithTranslation;
exports.getStudent = getStudent;