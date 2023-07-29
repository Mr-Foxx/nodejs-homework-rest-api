const express = require('express');

const authRouter = express.Router();

const { userSingupSchema } = require('../../schemas/user-schema.js');

const User = require('../../models/user.js');

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userData = { name, email, password };
    const { error } = userSingupSchema.validate(userData);

    if (error) {
      return res.status(400).json(error.message);
    }

    const newUser = await User.create(userData);
    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
