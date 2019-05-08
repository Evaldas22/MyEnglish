const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const validateRegisterInput = require('../../validation/newGroup');

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
	logger.info("GET api/groups");
	GroupModel.find()
		.then(groups => res.json(constructChatFuelGroupNames(groups)))
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

module.exports = router;