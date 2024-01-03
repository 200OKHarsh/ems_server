const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  role: { type: String, required: true },
  doj: { type: String, required: true },
  position: { type: String, required: true },
  aadhar: { type: String, required: true },
  pan: { type: String, required: true },
  leaves: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Leave' }],
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('User', userSchema);
