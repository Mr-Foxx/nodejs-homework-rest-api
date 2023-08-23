const express = require('express');
const { nanoid } = require('nanoid');

const authRouter = express.Router();

const {
  userSingupSchema,
  userEmailSchema,
} = require('../../schemas/user-schema.js');

const User = require('../../models/user.js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const registrationError = require('../../helpers/registrationError.js');
const gravatar = require('gravatar');

const upload = require('../../helpers/upload.js');
const jimp = require('jimp');
const path = require('path');
const { sendEmail } = require('../../helpers/sendEmail.js');

dotenv.config();

const { JWT_SECRET, BASE_URL } = process.env;

authRouter.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;
  const userData = { name, email, password };
  const { error } = userSingupSchema.validate(userData);

  const verificationCode = nanoid();

  const hashPassword = await bcrypt.hash(password, 10);
  userData.password = hashPassword;
  userData.verificationCode = verificationCode;

  if (error) {
    return res.status(400).json(error.message);
  }

  const avatarURL = gravatar.url(email);
  userData.avatarURL = avatarURL;

  try {
    const newUser = await User.create(userData);

    const verifyEmail = {
      to: email,
      subject: 'Verify email',
      html: `<a href="${BASE_URL}/api/users/verify/${verificationCode}" target="_blank">Click to verify email</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    registrationError(err, res);
  }
});

authRouter.get('/verify/:verificationToken', async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.verificationToken) {
      return res.status(400).json({
        message: 'Verification code has already been used',
      });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({
      message: 'Verification successful',
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

authRouter.post('/verify', async (req, res, next) => {
  const { email } = req.body;
  const userData = { email };
  const { error } = userEmailSchema.validate(userData);

  console.log('UKR_NET_EMAIL:', process.env.UKR_NET_EMAIL);
  console.log('UKR_NET_PASSWORD:', process.env.UKR_NET_PASSWORD);

  const user = await User.findOne({ email });

  if (error) {
    return res.status(400).json(error.message);
  }

  if (!user) {
    return res.status(404).json({
      message: 'Email not found',
    });
  }

  if (user.verify) {
    return res.status(400).json({
      message: 'Verification has already been passed',
    });
  }

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationCode}" target="_blank">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: 'Verification email sent',
  });
});

authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: 'Email or password is wrong',
    });
  }

  if (!user.verify) {
    return res.status(401).json({
      message: 'Email not varify',
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

authRouter.patch('/avatars', upload.single('avatar'), async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const avatar = await jimp.read(req.file.path);
    await avatar.cover(250, 250);

    const avatarName = `avatar_${user._id}${path.extname(
      req.file.originalname
    )}`;
    const avatarPath = path.join('public', 'avatars', avatarName);
    await avatar.writeAsync(avatarPath);

    user.avatarURL = `/avatars/${avatarName}`;
    await user.save();

    res.status(200).json({
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = authRouter;
