const User = require("./../models/userModel");
const Contact = require("./../models/contactModel");

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-__v");
      res.status(200).json({
        status: "success",
        results_count: users.length,
        users,
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err.message,
      });
    }
  };

  exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select(" -__v").populate("contacts");
      const starredContacts = await Contact.find({user: req.params.id, category: "Starred"})
      const importantContacts = await Contact.find({user: req.params.id, category: "Important"})
      res.status(200).json({
        status: "success",
        user : {
        groups_count: user.groups.length,
        important_count: importantContacts.length,
        _id: user.id,
        name: user.name,
        email: user.email,
        tags: [...user.tags.sort()],
        groups: [...user.groups.sort()],
        tags_count: user.tags.length,
        starred_count: starredContacts.length,
        contacts_count: user.contacts.length
        }
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err.message,
      });
    }
  };

  exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };

exports.updateMe = async(req, res) => {
try{
//Create error if user POSTS password data
if(req.body.password || req.body.passwordConfirm) {
  throw "This route is not for password updates. Please use /updateMyPassword."
}
// 3) Update user document
const user = await User.findByIdAndUpdate(req.user.id, req.body, {
new: true,
runValidators: true
});
res.status(200).json({
status: 'success',
updatedUser : {
  groups_count: user.groups_count,
  important_count: user.important_count,
  _id: user.id,
  name: user.name,
  email: user.email,
  tags: [...user.tags.sort()],
  groups: [...user.groups.sort()],
  tags_count: user.tags_count,
  starred_count: user.starred_count,
  }
});
} catch (err)
  {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
  }

