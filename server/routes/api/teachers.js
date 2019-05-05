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
const validateChangePwdInput = require('../../validation/changePwd');

// Load Teacher model
const Teacher = require('../../models/Teacher').TeacherModel;

// @route   POST api/teachers/register
// @desc    Register user
// @access  Public
router.post('/teachers/register', (req, res) => {
  logger.info('POST api/teachers/register');

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

  Teacher.findOne({ name: req.body.name.trim() }).then(teacher => {
    if (teacher) {
      logger.error(`Teacher ${teacher.name} already exists`);
      return res.status(400).json({ name: 'That name already exists' });
    }

    const newTeacher = new Teacher({
      teacherId: uuidv4(),
      name: req.body.name.trim(),
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

  const teacherName = req.body.name.trim();
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
          role: teacher.role,
          firstTimeLoggedIn: teacher.firstTimeLoggedIn
        };
        // Sign token
        jwt.sign(
          payload,
          secret,
          {
            expiresIn: 60 // 10 minutes in seconds
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

// @route   POST api/teachers/changePwd
// @desc    Change user password
// @access  Public
router.post('/teachers/changePwd', (req, res) => {
  logger.info('POST api/teachers/changePwd');

  // Form validation
  const { errors, isValid } = validateChangePwdInput(req.body);

  // Check validation
  if (!isValid) {
    logger.error('Error changing user password');
    logger.error(errors.password);
    logger.error(errors.password2);
    return res.status(400).json(errors);
  }

  Teacher.findOne({ name: req.body.name.trim() }).then(teacher => {
    if (!teacher) {
      logger.error(`Teacher ${teacher.name} does not exist`);
      return res.status(400).json({ name: 'That name does not exist' });
    }

    const password = req.body.password;

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        // update teacher
        teacher.password = hash;
        teacher.firstTimeLoggedIn = false;

        teacher
          .save()
          .then(teacher => {
            logger.info(`Password for teacher ${teacher.name} changed successfully!`);
            res.json(teacher);
          })
          .catch(err => logger.error(err));
      });
    });
  });
});

module.exports = router;