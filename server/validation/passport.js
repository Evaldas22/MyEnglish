const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Teacher = mongoose.model('teachers');
const secret = require('../config/secret').secret;
const logger = require('../logging/logger');

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Teacher.findById(jwt_payload.id)
        .then(teacher => {
          if (teacher) {
            return done(null, teacher);
          }
          return done(null, false);
        })
        .catch(err => logger.error(err));
    })
  );
};