const saveError = (error, data, next) => {
  const { code, name } = error;
  const status = code === 11000 && name === 'MongoServerError' ? 409 : 400;
  error.status = status;

  next(error);
};

module.exports = saveError;
