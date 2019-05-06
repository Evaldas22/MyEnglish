const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const validateRegisterInput = require('../../validation/newGroup');

var GroupModel = require('../../models/Group').GroupModel;

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

module.exports = router;