const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');

var GroupModel = require('../../models/Group').GroupModel;
var StudentModel = require('../../models/Student').StudentModel;
var DayUpdateModel = require('../../models/DayUpdate').DayUpdateModel;
var WordModel = require('../../models/Word').WordModel;
var _ = require('lodash');

// @route   POST api/newStudent
// @desc    Create new student
// @access  Public
router.post('/newStudent', (req, res) => {
	logger.info('POST /api/newStudent');

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

// @route   POST api/student
// @desc    Add student day update
// @access  Public
router.post('/student', (req, res) => {
	const messengerId = req.body['messenger user id'];
	const groupName = req.body.groupName;
	const newWords = req.body.newWords;

	logger.info(`POST api/student for ${messengerId}[${groupName}]`);

	GroupModel.findOne({ groupName: groupName }).then(group => {
		// if this is new group
		if (_.isUndefined(group)) {
			logger.info(`Creating new group -  ${groupName}`);

			const newStudent = constructNewStudent(req.body);
			const newGroup = new GroupModel({
				groupName: groupName,
				students: [newStudent]
			});

			GroupModel.create(newGroup)
				.then(saveGroupData => {
					logger.info(`Group ${groupName} created`);
					res.json(saveGroupData)
				})
				.catch(err => {
					logger.error(`Failed to create group ${groupName}`);
					logger.error(err);
					res.status(500).json(err)
				});
		}
		else {
			const student = getStudent(group, messengerId);

			// if this is new student
			if (_.isUndefined(student)) {
				logger.info(`Creating new student ${messengerId}`);

				const newStudent = constructNewStudent(req.body);
				group.students.push(newStudent);

				group.save(err => {
					if (err) {
						logger.error(`Failed to save group ${groupName} with student ${messengerId}`);
						logger.error(err);
						return res.status(500).json(err);
					}
					res.json(newStudent);
				});
			}
			else {
				// Need to update knownWords and dayUpdates
				const newDayUpdate = constructDayUpdate(req.body);
				const newWordsToBeAdded = getNewWords(student.knownWords, getWordsArrayFromString(newWords));

				student.dayUpdates.push(newDayUpdate);
				student.knownWords.push.apply(student.knownWords, newWordsToBeAdded);

				group.save(err => {
					if (err) {
						logger.error(`Failed to save group ${groupName} with student ${messengerId}`);
						logger.error(err);
						return res.status(500).json(err);
					}
					res.json(student);
				});
			}
		}
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

const constructNewStudent = body => {
	return new StudentModel({
		messengerId: body["messenger user id"],
		name: body["first name"] + " " + body["last name"],
		englishLevel: body.englishLevel,
		groupName: body.groupName,
		knownWords: constructKnownWords(getWordsArrayFromString(body.newWords)),
		dayUpdates: [constructDayUpdate(body)]
	});
}

const constructDayUpdate = body => {
	const newWordsArray = getWordsArrayFromString(body.newWords);
	const newUniqueWords = [...new Set(newWordsArray)];

	return new DayUpdateModel({
		learnedToday: getLearnedToday(body.learnedToday, body.learnedTodayExtended),
		lessonRating: body.lessonRating || 0,
		lessonRatingExplanation: body.lessonRatingExplanation || "",
		newWords: newUniqueWords
	});
}

const constructKnownWords = words => {
	return words.map(word => {
		return new WordModel({
			word: word,
			score: 0
		})
	})
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

const getLearnedToday = (learnedToday, extension) => {
	return learnedToday + (extension ? (". " + extension) : "")
}

const getWordsArrayFromString = (wordsString) => {
	return wordsString.split(/[\s,]+/);
}

exports.router = router;
exports.getStudent = getStudent;
exports.getNewWords = getNewWords;
exports.getWordsArrayFromString = getWordsArrayFromString;