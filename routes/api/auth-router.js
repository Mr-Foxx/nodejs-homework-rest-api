const express = require('express');

const authRouter = express.Router();

const { userSingupSchema } = require('../../schemas/user-schema.js');

const User = require('../../models/user.js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const registrationError = require('../../helpers/registrationError.js');

dotenv.config();

const { JWT_SECRET } = process.env;

authRouter.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;
  const userData = { name, email, password };
  const { error } = userSingupSchema.validate(userData);

  const hashPassword = await bcrypt.hash(password, 10);
  userData.password = hashPassword;

  if (error) {
    return res.status(400).json(error.message);
  }

  try {
    const newUser = await User.create(userData);
    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    // if (err.code === 11000 && err.name === 'MongoServerError') {
    //   err.status = 409;
    //   err.message = 'Email in use';
    // } else {
    //   err.status = 500;
    // }
    // return res.status(err.status).json(err.message);
    registrationError(err, res);
  }
});

authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: 'Email or password is wrong',
    });
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    return res.status(401).json({
      message: 'Email or password is wrong',
    });
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '23h' });

  // коли логінюсь зберігаю токен в mongodb
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
});

authRouter.get('/current', async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized1111' });
    }

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(id);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized2222' });
      }

      const { name, email } = user;

      res.json({
        name,
        email,
      });
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized1111' });
    }

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(id);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized2222' });
      }

      const { _id } = user;
      await User.findByIdAndUpdate(_id, { token: '' });
      // const { _id } = req.user;

      res.json({
        message: 'Logout ssucess',
      });
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
