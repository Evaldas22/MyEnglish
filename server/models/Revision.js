const mongoose = require('mongoose');
const RevisionWordSchema = require('./RevisionWord').RevisionWordSchema;

const RevisionSchema = new mongoose.Schema({
    wordsUnderRevision: [RevisionWordSchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
});

const RevisionModel = mongoose.model('revisions', RevisionSchema);

exports.RevisionSchema = RevisionSchema;
exports.RevisionModel = RevisionModel;