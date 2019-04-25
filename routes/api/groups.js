const express = require('express');
const router = express.Router();

var GroupModel = require('../../models/Group');

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/groups', (req, res) => {
	GroupModel.find()
		.then(group => res.json(group))
});

// @route   GET api/group/{groupName}
// @desc    Get all students for certain group
// @access  Public
router.get('/group', (req, res) => {
	GroupModel.find({ name: req.query.groupName })
		.then(group => res.json(group))
});

module.exports = router;