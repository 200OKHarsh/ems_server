const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authorization Failed', 401);
    }
    const decodedToken = jwt.verify(token, 'dragon_ball_z');
    req.userData = {
      userId: decodedToken.userId,
      role: decodedToken.role
    };
    next();
  } catch (error) {
    const err = new HttpError('Authorization Failed', 401);
    return next(err);
  }
};
