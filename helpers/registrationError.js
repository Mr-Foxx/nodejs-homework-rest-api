function registrationError(err, res) {
  if (err.code === 11000 && err.name === 'MongoServerError') {
    err.status = 409;
    err.message = 'Email in use';
  } else {
    err.status = 500;
  }
  return res.status(err.status).json(err.message);
}

module.exports = registrationError;
