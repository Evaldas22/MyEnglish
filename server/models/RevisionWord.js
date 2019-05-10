const mongoose = require('mongoose');

const RevisionWordSchema = new mongoose.Schema({
    word: {
      type: String,
      required: true
    },
    translation: {
      type: String,
      required: true
    },
    guess: {
      type: String,
      required: true
    }
});

const RevisionWordModel = mongoose.model('revisionsWords', RevisionWordSchema);

exports.RevisionWordSchema = RevisionWordSchema;
exports.RevisionWordModel = RevisionWordModel;