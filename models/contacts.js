const { Schema, model } = require('mongoose');
const saveError = require('../helpers/Save.Error.js');
const validateUpdate = require('../helpers/validateUpdate.js');

const contactsSchema = Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

// , timestamps: true

contactsSchema.pre('findOneAndUpdate', validateUpdate);

contactsSchema.post('save', saveError);
contactsSchema.post('findOneAndUpdate', saveError);

const Contact = model('contact', contactsSchema);

module.exports = Contact;
