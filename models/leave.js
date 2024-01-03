const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leaveSchema = new Schema(
  {
    reason: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    status: { type: String, default: false },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
