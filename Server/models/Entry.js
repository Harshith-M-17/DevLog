const mongoose = require('mongoose');


const entrySchema = new mongoose.Schema({
  workDone: { type: String, required: true },
  blockers: { type: String, required: true },
  learnings: { type: String, required: true },
  githubCommitLink: { type: String },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Entry', entrySchema);
