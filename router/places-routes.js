// const express = require('express');
// const { check } = require('express-validator');
// const router = express.Router();
// const placesController = require('../controllers/places-controllers');
// const fileUpload = require('../middleware/file-upload');
// const checkAuth = require('../middleware/check-auth');

// router.get('/:pid', placesController.getPlaceById);

// router.get('/user/:uid', placesController.getPlacesByUserId);

// router.use(checkAuth);

// router.post(
//   '/',
//   fileUpload.single('image'),
//   [
//     check('title').not().isEmpty(),
//     check('description').isLength({ min: 5 }),
//     check('address').isLength({ min: 5 }),
//   ],
//   placesController.createPlace
// );

// router.patch(
//   '/:pid',
//   [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
//   placesController.updatePlaceById
// );

// router.delete('/:pid', placesController.deletePlaceById);
// module.exports = router;
