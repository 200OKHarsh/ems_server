const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');


router.post('/login', userController.login);

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserById);

router.use(checkAuth);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  userController.signup
);

router.patch(
  '/editprofile/:uid',
  [check('name').not().isEmpty(), check('password').isLength({ min: 4 })],
  userController.editprofile
);

router.patch('/edituser/:uid', userController.edituser);

router.patch('/editimage/:uid', fileUpload.single('image'), userController.editimage);

module.exports = router;
