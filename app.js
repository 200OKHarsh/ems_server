const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const placeRoutes = require('./router/places-routes');
const userRoutes = require('./router/users-routes');
const leaveRoutes = require('./router/leave-routes');
const HttpError = require('./models/http-error');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/leave', leaveRoutes);

app.get('/health', (req, res, next) => {
  res.json({ message: 'Working on port 5000' });
});
app.use((req, res, next) => {
  const error = new HttpError('Could Not Found This Route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An Unknown Error Occured' });
});

mongoose
  .connect(
    'mongodb+srv://root:root@cluster0.stambh3.mongodb.net/ems?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));