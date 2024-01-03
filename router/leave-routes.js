const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const leaveController = require('../controllers/leave-controllers');

router.use(checkAuth);

router.get('/', leaveController.getLeave);

router.get('/user/:uid', leaveController.getLeaveByUserId);

router.post('/', leaveController.createLeave);

router.patch('/updatestatus/:lid', leaveController.updateStatus);

module.exports = router;