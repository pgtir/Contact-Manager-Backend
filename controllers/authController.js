const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

exports.protect = async(req, res, next) => {
let statusCode = 401;
try {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    statusCode = 401;
    throw 'You are not logged in! Please log in to get access.';
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    statusCode = 401;
    throw 'The user belonging to this token does no longer exist.';
  }
  req.user = currentUser;
  next();
} catch(err) {
  res.status(statusCode).json({
    status: "fail",
    message: err,
  });
}
}

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password_confirm: req.body.password_confirm,
    });

    const token = signToken(user._id);
    user.password = undefined;
    res.status(201).json({
      status: "success",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  let statusCode;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      statusCode = 400;
      throw "Please provide both email and password";
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      statusCode = 401;
      throw "Incorrect email or password!";
    }
    const token = signToken(user._id);
    user.password = undefined;
    user.__v = undefined;
    res.status(200).json({
      status: "success",
      token,
      user
    });
  } catch (err) {
    res.status(statusCode).json({
      status: "fail",
      message: err,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  let statusCode;
  try {
    if (!req.body.email) {
      statusCode = 400;
      throw "Please provide email";
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      statusCode = 404;
      throw "There is no user with this email address";
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and password_confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "fail",
      message: "There was an error sending the email. Try again later!",
    });
    }
  } catch (err) {
    res.status(statusCode).json({
      status: "fail",
      message: err,
    });
  }
};

exports.resetPassword = async (req, res) => {
  let statusCode;
  try {
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    statusCode = 400;
    throw 'Token is invalid or has expired';
  }
  user.password = req.body.password;
  user.password_confirm = req.body.password_confirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  }
  catch(err) {
    res.status(statusCode).json({
      status: "fail",
      message: err,
    });
  }
}
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

exports.updatePassword = async (req, res) => {
  try {
// 1) Get user from collection
const user = await User.findById(req.user.id).select('+password');

// 2) Check if POSTed current password is correct
if (!(await user.correctPassword(req.body.password_current, user.password))) {
  throw 'Your current password is wrong.';
}

// 3) If so, update password
user.password = req.body.password_new;
user.password_confirm = req.body.password_confirm;
await user.save();
// User.findByIdAndUpdate will NOT work as intended!

// 4) Log user in, send JWT
const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch(err) {
    res.status(401).json({
      status: "fail",
      message: err
    });
  }
  
};