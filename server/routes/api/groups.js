const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const validateRegisterInput = require('../../validation/newGroup');
const moment = require('moment');
const DailyTargetUpdateModel = require('../../models/DailyTargetUpdate').DailyTargetUpdateModel;
const DailyTargetUpdateItemModel = require('../../models/DailyTargetUpdateItem').DailyTargetUpdateItemModel;

var GroupModel = require('../../models/Group').GroupModel;
const DailyTargetModel = require('../../models/DailyTarget').DailyTargetModel;

// @route   GET api/groups/{teacherId}
// @desc    Get all students for one teacher
// @access  Public
router.get('/groups', (req, res) => {
	logger.info(`GET api/groups/${req.query.teacherId} `);
	GroupModel.find({ teacherId: req.query.teacherId })
		.then(group => res.json(group))
});

// @route   POST api/groups/newGroup
// @desc    Create new group
// @access  Public
router.post('/groups/newGroup', (req, res) => {
	logger.info('POST api/groups/newGroup');

	// Form validation
	const { errors, isValid } = validateRegisterInput(req.body);

	// Check validation
	if (!isValid) {
		logger.error('Error creating new group');
		if (errors.groupName) logger.error(errors.groupName);
		if (errors.teacherId) logger.error(errors.teacherId);
		return res.status(400).json(errors);
	}

	const groupName = req.body.groupName.trim();
	const teacherId = req.body.teacherId;

	GroupModel.findOne({ groupName: groupName }).then(group => {
		if (group) {
			logger.error(`Group ${group.groupName} already exists`);
			return res.status(400).json({ groupName: 'That group name already exists' });
		}

		const newGroup = new GroupModel({
			groupName: groupName,
			students: [],
			teacherId: teacherId,
			dailyTargets: []
		});

		GroupModel.create(newGroup)
			.then(saveGroupData => {
				logger.info(`Group ${groupName} created`);
				res.json(saveGroupData)
			})
			.catch(err => {
				logger.error(`Failed to create group ${groupName}`);
				logger.error(err);
				res.json(500).json(`Failed to create group ${groupName}`)
			});
	});
});

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', (req, res) => {
	logger.info("GET api/groups");
	GroupModel.find()
		.then(group => res.json(group))
});

// @route   GET api/groupNames
// @desc    Get all group names
// @access  Public
router.get('/groupNames', (req, res) => {
	logger.info("GET api/groupNames");
	GroupModel.find()
		.then(groups => res.json(constructChatFuelGroupNames(groups)))
});

// @route   GET api/group/dailyTarget
// @desc    Get one daily target for certain group
// @access  Public
router.get('/group/dailyTarget', (req, res) => {
	logger.info("GET api/group/dailyTarget");

	const { groupName, dailyTargetNum } = req.query;

	GroupModel.findOne({ groupName: groupName })
		.then(group => {
			if (!group) {
				logger.error(`Group ${groupName} not found`);
				return res.json(400).json(`Group ${groupName} not found`);
			}

			// latest target will be the last one added
			const latestDailyTarget = group.dailyTargets[group.dailyTargets.length - 1];
			if (!latestDailyTarget) {
				logger.error(`No daily targets for group ${groupName}`);
				return res.json(400).json(`No daily targets for group ${groupName}`);
			}

			if (dailyTargetNum > latestDailyTarget.listOfTargets.length) {
				res.json(constructChatFuelNoMoreDailyTargets());
			}
			else{
				res.json(constructChatFuelDailyTarget(latestDailyTarget.listOfTargets[dailyTargetNum - 1]));
			}
		})
});

// @route   POST api/group/dailyTarget
// @desc    Update daily target evaluation
// @access  Public
router.post('/group/dailyTarget', (req, res) => {
	logger.info("POST api/group/dailyTarget");

	// Take all parameters from POST body
	const { groupName, dailyTargetNum, dailyTargetEvaluation } = req.body;
	const messengerId = req.body['messenger user id'];

	GroupModel.findOne({ groupName: groupName })
		.then(group => {
			if (!group) {
				logger.error(`Group ${groupName} not found`);
				return res.json(400).json(`Group ${groupName} not found`);
			}

			// Find the student
			let existingStudent;
			group.students.forEach(student => {
				if (student.messengerId === messengerId) {
					existingStudent = student;
					return;
				}
			})
			if (!existingStudent) {
				logger.error(`Student ${messengerId} not found`);
				return res.json(400).json(`Student ${messengerId} not found`);
			}

			// Find latest daily update and take it's date in simplified format
			const latestDailyTarget = group.dailyTargets[group.dailyTargets.length - 1];
			const simplifiedDate = moment(latestDailyTarget.date).format('YYYY-MM-DD');

			// Check all student daily updates and check if there is one for date when latest daily target was saved (simplifiedDate)
			let existingDailyTartgetUpdate;
			existingStudent.dailyTargetUpdates.forEach(dailyTargetUpdate => {
				if (dailyTargetUpdate.date === simplifiedDate) {
					existingDailyTartgetUpdate = dailyTargetUpdate;
					return;
				}
			});

			// Create new daily target update item with target itself and it's rating 
			const newDailyTargetUpdateItem = new DailyTargetUpdateItemModel({
				target: latestDailyTarget.listOfTargets[dailyTargetNum - 1],
				rating: dailyTargetEvaluation
			});

			if (!existingDailyTartgetUpdate) {
				// this is the first daily target that day, so we want to create new daily target object and append to all daily targets
				const newDailyTargetUpdate = new DailyTargetUpdateModel({
					date: simplifiedDate,
					targetUpdates: [newDailyTargetUpdateItem]
				});

				existingStudent.dailyTargetUpdates.push(newDailyTargetUpdate);
			}
			else{
				// if daily target update object already exists, simply another target evaluation rating to it
				existingDailyTartgetUpdate.targetUpdates.push(newDailyTargetUpdateItem);
			}

			// save all changes
			group.save(err => {
				if (err) {
					logger.error(`Failed to update daily target for student ${messengerId} in group ${groupName}`);
					logger.error(err);
					return res.status(500).json(err);
				}
				res.json(existingStudent);
			});

		})
});


// @route   POST api/groups/newDailyTarget
// @desc    Create new daily target
// @access  Public
router.post('/groups/newDailyTarget', (req, res) => {
	logger.info('POST api/groups/newDailyTarget');

	GroupModel.findOne({ _id: req.body.id }).then(group => {
		if (!group) {
			logger.error(`Group ${req.body.groupName} does not exist`);
			return res.status(400).json({ group: 'Group does not exist' });
		}

		const listOfNewDailyTargets = getArrayFromString(req.body.dailyTargets);

		const newDailyTarget = new DailyTargetModel({
			listOfTargets: listOfNewDailyTargets
		});

		group.dailyTargets.push(newDailyTarget);

		group.save(err => {
			if (err) {
				logger.error(`Error saving new daily target for group ${groupName}`);
				logger.error(err);
				return res.status(500).json(err);
			}
			res.json(group);
		});
	})
});

const getArrayFromString = string => (string.split(/[,.][\s]*/))

const constructChatFuelGroupNames = groups => {
	const groupNames = groups.map(group => group.groupName);

	const chatFuelMessage = {
		messages: [
			{
				text: "Please select your learning group name.",
				quick_replies: groupNames.map(groupName => ({
					title: groupName,
					set_attributes: {
						groupName
					}
				})),
				quick_reply_options: {
					process_text_by_ai: false
				}
			}
		]
	}

	return chatFuelMessage;
}

const constructChatFuelDailyTarget = dailyTarget => {
	return {
		messages: [
			{text: `In scale (1-10) how well did you learn this topic - ${dailyTarget}?`}
		]
	 };
}

const constructChatFuelNoMoreDailyTargets = () => {
	return {
		redirect_to_blocks: ["Daily Target Finish"]
	 };
}

module.exports = router;