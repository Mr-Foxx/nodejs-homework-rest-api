const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const User = require('../models/user.js');

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized11' });
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(id);

    if (!user || !user.token) {
      return res.status(401).json({ error: 'Unauthorized22' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

module.exports = { authenticate };
