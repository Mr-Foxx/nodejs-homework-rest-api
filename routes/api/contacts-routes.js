const express = require('express');
const contactsService = require('../../models/contacts.js');
const HttpError = require('../../helpers/Http.Error.js');
const router = express.Router();
const contactAddSchema = require('../../schemas/contact-schemas.js');
const missingFields = require('../../helpers/misingFilds.js');

router.get('/', async (req, res, next) => {
  try {
    const result = await contactsService.listContacts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contactsService.getContactById(id);

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

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const contactData = { name, email, phone };
    const { error } = contactAddSchema.validate(contactData);

    missingFields(req, res, { name, email, phone });

    if (error) {
      throw HttpError(404, error.message);
    }

    const result = await contactsService.addContact(name, email, phone);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const contactData = { name, email, phone };
    const { error } = contactAddSchema.validate(contactData);

    missingFields(req, res, { name, email, phone });

    if (error) {
      throw HttpError(404, error.message);
    }

    const { id } = req.params;
    const result = await contactsService.updateContact(id, req.body);

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

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contactsService.removeContact(id);

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

module.exports = router;
