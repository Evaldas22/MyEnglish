const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');

var GroupModel = require('../../models/Group').GroupModel;

// @route   GET api/groups/{teacherId}
// @desc    Get all students for one teacher
// @access  Public
router.get('/groups', (req, res) => {
	logger.info(`GET api/groups/${req.query.teacherId} `);
	GroupModel.find({ teacherId: req.query.teacherId })
		.then(group => res.json(group))
});

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', (req, res) => {
	logger.info("GET api/groups");
	GroupModel.find()
		.then(group => res.json(group))
});

module.exports = router;