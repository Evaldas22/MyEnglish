const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
// const secret = require('../../config/secret').secret;
const secret = process.env.secret;

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
      role: 'teacher',
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

// @route   POST api/teachers/login
// @desc    Login teacher and return JWT token
// @access  Public
router.post('/teachers/login', (req, res) => {
  logger.info('POST api/teachers/login');

  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    logger.error('Error registering teacher');
    logger.error(errors.name);
    logger.error(errors.password);
    return res.status(400).json(errors);
  }

  const teacherName = req.body.name;
  const password = req.body.password;

  // Find teacher by name
  Teacher.findOne({ name: teacherName }).then(teacher => {
    // Check if teacher exists
    if (!teacher) {
      logger.error(`Teacher ${teacherName} does not exists`);
      return res.status(404).json({ nameNotfound: 'Teacher with that name not found' });
    }
    
    // Check password
    bcrypt.compare(password, teacher.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: teacher.id,
          name: teacher.name,
          role: teacher.role
        };
        // Sign token
        jwt.sign(
          payload,
          secret,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            logger.info(`Teacher ${teacher.name} logged in`);
            res.json({
              success: true,
              token: `Bearer ${token}`
            });
          }
        );
      } else {
        logger.error('Incorrect password');
        return res
          .status(400)
          .json({ passwordincorrect: 'Password incorrect' });
      }
    });
  });
});

module.exports = router;