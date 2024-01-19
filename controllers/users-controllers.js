const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password -aadhar -pan');
  } catch (error) {
    return next(new HttpError('Cannot Fetch Users', 401));
  }

  res.status(200).json(users.map((u) => u.toObject({ getters: true })));
};

const getUserById = async (req, res, next) => {
  let user;
  const userId = req.params.userId;
  try {
    user = await User.findById(userId, '-password');
  } catch (error) {
    return next(new HttpError('Cannot Find User', 401));
  }
  if (!user) {
    return next(new HttpError('No User Found with this id', 401));
  }
  res.status(200).json(user.toObject({ getters: true }));
};

const signup = async (req, res, next) => {
  if (req.userData.role !== 'admin') {
    return next(new HttpError('Only Admin Can Create User', 422));
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid Inputs', 422));
  }

  const { name, email, password, doj, pan, aadhar, position, role } = req.body;

  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError('Signup Failed', 500);
    return next(err);
  }
  if (hasUser) {
    const error = new HttpError('Users Already Exists', 422);
    return next(error);
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError('Could Not Create A User', 500);
    return next(err);
  }
  if (!req.file) {
    const err = new HttpError('Please Upload Profile Image', 401);
    return next(err);
  }

  const newUser = new User({
    name,
    email,
    password: hashPassword,
    image: req.file.path,
    doj,
    position,
    aadhar,
    pan,
    role: 'user',
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    const err = new HttpError('Creating Users Failed', 500);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      'dragon_ball_z',
      { expiresIn: '1h' }
    );
  } catch (error) {
    const err = new HttpError('Creating Users Failed', 500);
    return next(err);
  }
  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError('login Failed', 500);
    return next(err);
  }

  if (!hasUser) {
    return next(new HttpError('Credentials Are Wrong', 401));
  }

  let isValidPass = false;
  try {
    isValidPass = await bcrypt.compare(password, hasUser.password);
  } catch (error) {
    const err = new HttpError(
      'Something went Wrong! Check Your Credentials',
      401
    );
    return next(err);
  }
  if (!isValidPass) {
    const err = new HttpError(
      'Something went Wrong! Check Your Credentials',
      401
    );
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: hasUser.id,
        email: hasUser.email,
        role: hasUser.role,
      },
      'dragon_ball_z',
      { expiresIn: '1h' }
    );
  } catch (error) {
    const err = new HttpError('Login In Failed', 500);
    return next(err);
  }

  res.json({
    userId: hasUser.id,
    email: hasUser.email,
    token: token,
    role: hasUser.role,
    name: hasUser.name
  });
};

const editprofile = async (req, res, next) => {
  if (req.userData.role !== 'admin') {
    return next(new HttpError('Only Admin Can Edit This Field', 403));
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid Inputs', 422));
  }

  const { name, email, password, doj, position, aadhar, pan } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError('User Not Found ', 404);
    return next(err);
  }

  if (!user) {
    return next(new HttpError('User Not Found', 404));
  }

  user.name = name;
  user.email = email;
  user.doj = doj;
  user.aadhar = aadhar;
  user.pan = pan;
  user.position = position;

  if (password) {
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 12);
      user.password = hashPassword;
    } catch (error) {
      const err = new HttpError('Could Not Create A User', 500);
      return next(err);
    }
  }
  try {
    await user.save();
  } catch (error) {
    return next(new HttpError(error, 404));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};
const edituser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid Inputs', 422));
  }

  const { name, password } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError('User Not Found ', 404);
    return next(err);
  }

  if (!user) {
    return next(new HttpError('User Not Found', 404));
  }
  if (user.id.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place', 404));
  }

  user.name = name;
  if (password) {
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 12);
      user.password = hashPassword;
    } catch (error) {
      const err = new HttpError('Could Not Create A User', 500);
      return next(err);
    }
  }
  try {
    await user.save();
  } catch (error) {
    return next(new HttpError(error, 404));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const editimage = async (req, res, next) => {

  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError('User Not Found ', 404);
    return next(err);
  }

  if (!user) {
    return next(new HttpError('User Not Found', 404));
  }
  const hasAceess = userId === user.id || user.role === 'admin';

  if (hasAceess) {
    return next(new HttpError('Only Admin Can Create User', 422));
  }

  if (!req.file) {
    const err = new HttpError('Please Upload Profile Image', 401);
    return next(err);
  }

  const imagePath = user.image;
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  user.image = req.file.path;

  try {
    await user.save();
  } catch (error) {
    return next(new HttpError(error, 404));
  }

  res.status(200).json({ message: 'Image Updated' });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.editprofile = editprofile;
exports.edituser = edituser;
exports.editimage = editimage;
exports.signup = signup;
exports.login = login;
