const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please tell us your name!']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: [true, "This email has already been signed in!"],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    tags_count: {
      type: Number,
      default: 0
    },
    groups_count: {
      type: Number,
      default: 0
    },
    starred_count: {
      type: Number,
      default: 0
    },
    important_count: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String]
    },
    groups: {
      type: [String]
    },
    role: {
      type: String,
      enum: ['user','admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    password_confirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date
  }, 
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
  
    this.password = await bcrypt.hash(this.password, 12);
    this.password_confirm = undefined;
    next();
  });
  
  userSchema.virtual('contacts', { 
    ref: 'Contact',  
    foreignField: 'user', 
    localField: '_id'
  });

  userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

 userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
 } 

const User = mongoose.model('User', userSchema);

module.exports = User;