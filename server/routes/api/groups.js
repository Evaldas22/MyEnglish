const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');

var GroupModel = require('../../models/Group').GroupModel;

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', (req, res) => {
	logger.info("GET api/groups - requesting data about all groups");
	GroupModel.find()
		.then(group => res.json(group))
});

// @route   GET api/group/{groupName}
// @desc    Get all students for certain group
// @access  Public
router.get('/group', (req, res) => {
	logger.info(`GET api/group/${groupName} - requesting data about specific group`);
	GroupModel.find({ name: req.query.groupName })
		.then(group => res.json(group))
});

module.exports = router;