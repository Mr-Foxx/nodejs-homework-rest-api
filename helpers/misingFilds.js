const missingFields = (req, res, { name, email, phone }) => {
  const missingFields = [];

  if (!name) {
    missingFields.push('name');
  }

  if (!email) {
    missingFields.push('email');
  }

  if (!phone) {
    missingFields.push('phone');
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `missing required ${missingFields} fields`,
    });
  }
};

module.exports = missingFields;
