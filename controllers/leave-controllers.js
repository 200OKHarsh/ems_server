const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Leave = require('../models/leave');
const User = require('../models/user');
const mongoose = require('mongoose');

const createLeave = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid Inputs', 422));
  }
  const { start, end, reason } = req.body;
  const userId = req.userData.userId;
  const newLeave = new Leave({
    start,
    end,
    reason,
    status: 'Pending',
    user: userId,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError(error, 404));
  }
  if (!user) {
    return next(new HttpError('Could Not Find User', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newLeave.save({ session: sess });
    user.leaves.push(newLeave);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError(error, 404));
  }

  res.status(200).json({ place: newLeave });
};

const getLeave = async (req, res, next) => {
  const allLeaves = await Leave.find().populate('user', 'name email');

  res.status(200).json({
    allLeaves: allLeaves.map((leave) => leave.toObject({ getters: true })),
  });
};

const getLeaveByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userLeaves;
  try {
    userLeaves = await User.findById(userId).populate('leaves');
  } catch (error) {
    const err = new HttpError('User Not Found', 404);
    next(err);
  }

  if (!userLeaves || userLeaves.length === 0) {
    return next(new HttpError('Could not found User id', 404));
  }
    
  res.status(200).json({
    allLeaves: userLeaves.leaves.map((leave) => leave.toObject({ getters: true })),
  });
};

const updateStatus = async (req, res, next) => {
  const leaveId = req.params.lid;

  const { status } = req.body;

  let leave;
  try {
    leave = await Leave.findById(leaveId);
  } catch (error) {
    const err = new HttpError('Id Not Found', 404);
    next(err);
  }

  leave.status = status;

  try {
    await leave.save();
  } catch (error) {
    const err = new HttpError('Can not update Status', 404);
    next(err);
  }

  res.status(200).json({ leave: leave.toObject({ getters: true }) });
};

module.exports.createLeave = createLeave;
module.exports.getLeave = getLeave;
module.exports.updateStatus = updateStatus;
module.exports.getLeaveByUserId = getLeaveByUserId;
