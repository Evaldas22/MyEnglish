const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuidv4  = require('uuid/v4');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load Teacher model
const Teacher = require('../../models/Teacher').TeacherModel;

// @route   POST api/teachers/register
// @desc    Register user
// @access  Public
router.post('/teachers/register', (req, res) => {
  logger.info('POST api/users/register');

  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    logger.error('Error registering teacher');
    logger.error(errors.name);
    logger.error(errors.password);
    logger.error(errors.password2);
    return res.status(400).json(errors);
  }

  Teacher.findOne({ name: req.body.name }).then(teacher => {
    if (teacher) {
      logger.error(`Teacher ${teacher.name} already exists`);
      return res.status(400).json({ name: 'That name already exists' });
    }

    const newTeacher = new Teacher({
      teacherId: uuidv4(),
      name: req.body.name,
      password: req.body.password,
      groups: []
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newTeacher.password, salt, (err, hash) => {
        if (err) throw err;

        newTeacher.password = hash;
        newTeacher
          .save()
          .then(teacher => {
            logger.info(`Teacher ${teacher.name} created successfully!`);
            res.json(teacher);
          })
          .catch(err => logger.error(err));
      });
    });
  });
});

module.exports = router;