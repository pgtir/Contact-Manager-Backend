const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A contact must have a name'],
      trim: true,
    },
    phone: {
        type: String,
        required: [true, 'A contact must have a phone no.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A contact must have an email'],
        // validate: [validator.isEmail, "Please provide a valid email"]
    }, 
    image: {
        type: String,
    },
    cloudinary_id: {
      type: String,
    },
    company: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: {
            values: ['Important', 'Starred', 'General'],
            message: 'Category is either: Important or Starred'
          }
    },
    starred: {
      type: Boolean,
      default: false
    },
    important: {
      type: Boolean,
      default: false
    },
    
    tagNames: {
        type: [String]
    },
    groupNames: {
        type: [String]
    },
    notes: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Contact must belong to a user']
    }
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
