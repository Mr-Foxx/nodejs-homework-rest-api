const { isValidObjectId } = require('mongoose');
const { HttpError } = require('../helpers/Http.Error.js');

const isValidId = (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(HttpError(404, `${id} is not valid`));
  }
  next();
};

module.exports = isValidId;
