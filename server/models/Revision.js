const mongoose = require('mongoose');
const RevisionWordSchema = require('./RevisionWord').RevisionWordSchema;

const RevisionSchema = new mongoose.Schema({
    wordsUnderRevision: [RevisionWordSchema],
    createdAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    }
});

const RevisionModel = mongoose.model('revisions', RevisionSchema);

exports.RevisionSchema = RevisionSchema;
exports.RevisionModel = RevisionModel;