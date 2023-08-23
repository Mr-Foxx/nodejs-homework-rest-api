const { Schema, model } = require('mongoose');

const saveError = require('../helpers/Save.Error.js');
const validateUpdate = require('../helpers/validateUpdate.js');

const emailRegexp = require('../helpers/emailRegexp.js');

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: emailRegexp,
    },
    password: {
      type: String,
      required: [true, 'Set password for use'],
      minlength: 6, // Замість minlenth
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    avatarURL: {
      type: String,
    },
    token: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      // required: [true, 'Verify token is required'],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre('findOneAndUpdate', validateUpdate);

userSchema.post('save', saveError);
userSchema.post('findOneAndUpdate', saveError);

const User = model('user', userSchema);

module.exports = User;
