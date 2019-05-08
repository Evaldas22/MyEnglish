const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');

var GroupModel = require('../../models/Group').GroupModel;
var StudentModel = require('../../models/Student').StudentModel;
var DayUpdateModel = require('../../models/DayUpdate').DayUpdateModel;
var WordModel = require('../../models/Word').WordModel;
var _ = require('lodash');

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
			dailyTargetUpdates: []
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
		const newWordsToBeAdded = getNewWords(existingStudent.knownWords, getWordsArrayFromString(newWords));

		existingStudent.dayUpdates.push(newDayUpdate);
		existingStudent.knownWords.push.apply(existingStudent.knownWords, newWordsToBeAdded);

		group.save(err => {
			if (err) {
				logger.error(`Failed to save group ${groupName} with student ${messengerId}`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(existingStudent);
		});
	})
});

const getNewWords = (knownWords, newWordsArr) => {
	const newUniqueWords = [...new Set(newWordsArr)];
	let newWordsToBeAdded = [];

	newUniqueWords.forEach(newWord => {
		// only add new word if it's not already in knowWords array
		if (!knownWords.filter(knownWord => (knownWord.word === newWord)).length > 0) {
			newWordsToBeAdded.push(new WordModel({
				word: newWord,
				score: 0
			}));
		}
	})

	return newWordsToBeAdded;
}

const constructDayUpdate = (newWords, lessonRating, lessonRatingExplanation) => {
	const newWordsArray = getWordsArrayFromString(newWords);
	const newUniqueWords = [...new Set(newWordsArray)];

	return new DayUpdateModel({
		lessonRating: lessonRating || 0,
		lessonRatingExplanation: lessonRatingExplanation || "",
		newWords: newUniqueWords
	});
}

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

const getWordsArrayFromString = (wordsString) => {
	return wordsString.split(/[\s,]+/);
}

exports.router = router;
exports.getStudent = getStudent;
exports.getNewWords = getNewWords;
exports.getWordsArrayFromString = getWordsArrayFromString;