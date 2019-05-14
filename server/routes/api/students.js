const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const _ = require('lodash');

var GroupModel = require('../../models/Group').GroupModel;
var StudentModel = require('../../models/Student').StudentModel;
var DayUpdateModel = require('../../models/DayUpdate').DayUpdateModel;
var WordModel = require('../../models/Word').WordModel;

// import functions 
const getWordsWithTranslationArrayFromString = require('./words').getWordsWithTranslationArrayFromString;
const getWordOrTranslation = require('./words').getWordOrTranslation;
const getNewWordsWithTranslation = require('./words').getNewWordsWithTranslation;
const getStudent = require('./words').getStudent;

// @route   POST api/student/newStudent
// @desc    Create new student
// @access  Public
router.post('/student/newStudent', (req, res) => {
	logger.info('POST /api/student/newStudent');

	// Get all the parameters from POST body
	const messengerId = req.body['messenger user id'];
	const firstName = req.body['first name'];
	const lastName = req.body['last name'];
	const { englishLevel, groupName } = req.body;

	GroupModel.findOne({ groupName: groupName }).then(group => {
		if (!group) {
			logger.error(`Group ${groupName} not found`);
			return res.json(400).json(`Group ${groupName} not found`);
		}

		// check if that student already exist
		const existingStudent = getStudent(group, messengerId);
		if (existingStudent) {
			logger.error(`Student ${messengerId} already exist`);
			return res.json(400).json(`Student ${messengerId} already exist`);
		}

		// create new student
		const newStudent = new StudentModel({
			messengerId: messengerId,
			name: firstName + " " + lastName,
			englishLevel: englishLevel,
			groupName: groupName,
			knownWords: [],
			dayUpdates: [],
			dailyTargetUpdates: [],
			revisions: []
		});

		// add and save new student
		group.students.push(newStudent);

		group.save(err => {
			if (err) {
				logger.error(`Failed to save group ${groupName} with student ${messengerId}`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(newStudent);
		});
	})
});

// @route   POST api/student/dayUpdate
// @desc    Add student day update
// @access  Public
router.post('/student/dayUpdate', (req, res) => {
	logger.info('POST api/student/dayUpdate');

	// Get all the parameters from POST body
	const messengerId = req.body['messenger user id'];
	const { lessonRating, newWords, groupName, lessonRatingExplanation } = req.body;

	GroupModel.findOne({ groupName: groupName }).then(group => {
		if (!group) {
			logger.error(`Group ${groupName} not found`);
			return res.json(400).json(`Group ${groupName} not found`);
		}

		// check if that student exists
		const existingStudent = getStudent(group, messengerId);
		if (!existingStudent) {
			logger.error(`Student ${messengerId} does not exist`);
			return res.json(400).json(`Student ${messengerId} does not exist`);
		}

		// Update knownWords and dayUpdates
		const newDayUpdate = constructDayUpdate(newWords, lessonRating, lessonRatingExplanation);
		getNewWordsWithTranslation(existingStudent.knownWords, getWordsWithTranslationArrayFromString(newWords))
			.then(newWords => {
				// const newWordsToBeAdded = getNewWords(existingStudent.knownWords, getWordsArrayFromString(newWords));

				existingStudent.dayUpdates.push(newDayUpdate);
				// existingStudent.knownWords.push.apply(existingStudent.knownWords, newWords);
				existingStudent.knownWords = newWords;

				group.save(err => {
					if (err) {
						logger.error(`Failed to save group ${groupName} with student ${messengerId}`);
						logger.error(err);
						return res.status(500).json(err);
					}
					res.json(existingStudent);
				});
			})
	})
});

// const getNewWords = (knownWords, newWordsArr) => {
// 	const newUniqueWords = [...new Set(newWordsArr)];
// 	let newWordsToBeAdded = [];

// 	newUniqueWords.forEach(newWord => {
// 		// only add new word if it's not already in knowWords array
// 		if (!knownWords.filter(knownWord => (knownWord.word === newWord)).length > 0) {
// 			newWordsToBeAdded.push(new WordModel({
// 				word: newWord,
// 				score: 0,
// 				frequency: 0
// 			}));
// 		}
// 	})

// 	return newWordsToBeAdded;
// }

const constructDayUpdate = (newWords, lessonRating, lessonRatingExplanation) => {
	const wordsWithTranslations = getWordsWithTranslationArrayFromString(newWords);
	const newWordsArray = getWordsArrayFromString(wordsWithTranslations);
	const newUniqueWords = [...new Set(newWordsArray)];

	return new DayUpdateModel({
		lessonRating: lessonRating || 0,
		lessonRatingExplanation: lessonRatingExplanation || "",
		newWords: newUniqueWords
	});
}

const getWordsArrayFromString = (wordsWithTranslations) => {
	return wordsWithTranslations.map(wordWithTranslation => {
		return getWordOrTranslation(wordWithTranslation, true);
	});
}

// exports.getNewWords = getNewWords;
exports.getWordsArrayFromString = getWordsArrayFromString;
exports.router = router;