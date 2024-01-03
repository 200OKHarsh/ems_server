// const HttpError = require('../models/http-error');
// const { validationResult } = require('express-validator');
// const { v4: uuidv4 } = require('uuid');
// const Place = require('../models/place');
// const User = require('../models/user');
// const mongoose = require('mongoose');
// const fs = require('fs');

// const getPlaceById = async (req, res, next) => {
//   const placeId = req.params.pid;
//   let place;
//   try {
//     place = await Place.findById(placeId);
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   if (!place) {
//     return next(new HttpError('Could not found Place id', 404));
//   }
//   res.json({ place: place.toObject({ getters: true }) });
// };

// const getPlacesByUserId = async (req, res, next) => {
//   const userId = req.params.uid;
//   let userWithplaces;
//   try {
//     userWithplaces = await User.findById(userId).populate('places');
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   if (!userWithplaces || userWithplaces.length === 0) {
//     return next(new HttpError('Could not found User id', 404));
//   }
//   res.json({
//     places: userWithplaces.places.map((p) => p.toObject({ getters: true })),
//   });
// };

// const createPlace = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(new HttpError('Invalid Inputs', 422));
//   }

//   const { title, description, address, creator } = req.body;

//   const coordinates = {
//     lat: 40.7484405,
//     lng: -73.9878584,
//   };

//   const createdPlace = new Place({
//     title,
//     description,
//     address,
//     location: coordinates,
//     image: req.file.path,
//     creator,
//   });

//   let user;
//   try {
//     user = await User.findById(creator);
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   if (!user) {
//     return next(new HttpError('Could Not Find User', 404));
//   }
//   try {
//     const sess = await mongoose.startSession();
//     sess.startTransaction();
//     await createdPlace.save({ session: sess });
//     user.places.push(createdPlace);
//     await user.save({ session: sess });
//     await sess.commitTransaction();
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }

//   res.status(200).json({ place: createdPlace });
// };

// const updatePlaceById = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(new HttpError('Invalid Inputs', 422));
//   }

//   const { title, description } = req.body;
//   const placeId = req.params.pid;
//   let place;
//   try {
//     place = await Place.findById(placeId);
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   if (!place) {
//     return next(new HttpError('Place not found', 404));
//   }
//   if (place.creator.toString() !== req.userData.userId) {
//     return next(new HttpError('You are not allowed to edit this place', 404));
//   }

//   place.title = title;
//   place.description = description;
//   try {
//     await place.save();
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   res.status(200).json({ place: place.toObject({ getters: true }) });
// };

// const deletePlaceById = async (req, res, next) => {
//   const placeId = req.params.pid;
//   let place;
//   try {
//     place = await Place.findById(placeId).populate('creator');
//   } catch (error) {
//     return next(new HttpError(error, 404));
//   }
//   if (!place) {
//     return next(new HttpError('Place is Not found', 404));
//   }

//   if (place.creator.id !== req.userData.userId) {
//     return next(new HttpError('You are not allowed to Delete this place', 404));
//   }
//   const imagePath = place.image;
//   try {
//     const sess = await mongoose.startSession();
//     sess.startTransaction();
//     await place.deleteOne({ session: sess });
//     place.creator.places.pull(place);
//     await place.creator.save({ session: sess });
//     await sess.commitTransaction();
//   } catch (error) {
//     console.log(error);
//     return next(new HttpError(error, 404));
//   }

//   fs.unlink(imagePath, (err) => {
//     console.log(err);
//   });
//   res.status(200).json({ message: 'Place Deleted' });
// };

// exports.getPlaceById = getPlaceById;
// exports.getPlacesByUserId = getPlacesByUserId;
// exports.createPlace = createPlace;
// exports.updatePlaceById = updatePlaceById;
// exports.deletePlaceById = deletePlaceById;
