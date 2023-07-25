const validateUpdate = function (next) {
  this.options.runValidators = true;
  next();
};

module.exports = validateUpdate;
