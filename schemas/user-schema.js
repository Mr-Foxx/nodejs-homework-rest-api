const Joi = require('joi');
const emailRegexp = require('../helpers/emailRegexp.js');

const userSingupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const userSinginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

module.exports = { userSinginSchema, userSingupSchema };
