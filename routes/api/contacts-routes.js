const express = require('express');
// const contactsService = require('../../models/contacts.js');
const HttpError = require('../../helpers/Http.Error.js');
const router = express.Router();
const { contactAddSchema } = require('../../schemas/contact-schemas.js');
const missingFields = require('../../helpers/misingFilds.js');
const Contact = require('../../models/contacts.js');
const isValid = require('../../helpers/isValid.js');
const {
  contactUpdateFavoriteSchema,
} = require('../../schemas/contact-schemas.js');
const { authenticate } = require('../../helpers/autenticate.js');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { _id: owner } = req.user;

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const result = await Contact.find({ owner }, '-createdAt -updatedAt', {
      skip,
      limit,
    }).populate('owner', 'name email');

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', isValid, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Contact.findById(id);

    if (!result) {
      throw HttpError(404, 'Not Found');
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, favorite } = req.body;
    const contactData = { name, email, phone, favorite };
    const { error } = contactAddSchema.validate(contactData);

    missingFields(req, res, { name, email, phone, favorite });

    if (error) {
      return res.status(404).json(error.message);
    }

    const { _id: owner } = req.user;
    const result = await Contact.create({ ...contactData, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', isValid, async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const contactData = { name, email, phone };
    const { error } = contactAddSchema.validate(contactData);

    missingFields(req, res, { name, email, phone });

    if (error) {
      // throw HttpError(404, error.message);

      return res.status(404).json(error.message);
    }

    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      return res.status(404).json({
        message: 'Not found',
      });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isValid, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        message: 'Not found',
      });
    }

    res.status(200).json({ message: 'contact deleted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/favorite', isValid, async (req, res, next) => {
  try {
    const { favorite } = req.body;
    const contactData = { favorite };
    const { error } = contactUpdateFavoriteSchema.validate(contactData);

    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (error) {
      return res.status(404).json(error.message);
    }

    if (!contact) {
      return res.status(404).json({
        message: 'Not found',
      });
    }

    contact.favorite = favorite;
    await contact.save();

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
