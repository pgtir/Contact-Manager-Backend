const Contact = require("./../models/contactModel");
const cloudinary = require("../utils/cloudinary");

exports.createContact = async (req, res) => {
  let result;
  try {
    if(!req.body.user) req.body.user = req.user._id;
    if(req.file)  result = await cloudinary.uploader.upload(req.file.path);

    const body = (req.file ? {
      ...req.body,
      image: result.secure_url,
      cloudinary_id: result.public_id
    }: {
      ...req.body
    })
    const contact = await Contact.create(body);
    res.status(201).json({
      status: "success",
      contact,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  let statusCode = 404;
  try {
    let {search, category, tag, group} = req.query
    const categoryFilter = (category === "General" ? {
      category: {
        $in: [
          "Starred",
          "Important",
          "General",
        ]
      }
    } : {category})
    console.log(search, category)
    const searchFilter = {
      $or : [{name: RegExp(search, 'i')}, {phone: { $regex: search }}]
    };
    let tagFilter = (tag? { tagNames: RegExp(tag, 'i')}: {})
    let groupFilter = (group? { groupNames: RegExp(group, 'i')}: {})
    const contact_filter ={
      ...searchFilter, user: req.user._id, ...categoryFilter, ...tagFilter, ...groupFilter 
    }
    const contacts = await Contact.find(contact_filter).select("-__v").sort("name");
    
    res.status(200).json({
      status: "success",
      results_count: contacts.length,
      contacts,
    });
  } catch (err) {
    res.status(statusCode).json({
      status: "fail",
      message: err,
    });
  }
};


exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select("-__v");
    res.status(200).json({
      status: "success",
      contact,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateContact = async (req, res) => {
  let result;
  let body;
  try {
    const contact = await Contact.findById(req.params.id);
    if(req.file) {
      if(contact.cloudinary_id) await cloudinary.uploader.destroy(contact.cloudinary_id);
      result = await cloudinary.uploader.upload(req.file.path);
      body = {
      image: result.secure_url,
      cloudinary_id: result.public_id
      }
    } else {
      body = (contact.cloudinary_id ? {
        ...req.body,
        image: contact.image,
      } : {
        ...req.body
      })
    }
    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      updatedContact,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateMany = async (req, res) => {
  const arr = req.params.ids.split(",");
  console.log(req.params.ids)
  console.log(arr)
  console.log(req.body)
  const filter = {
    _id: {
      $in: [
        ...arr
      ]
    }
  }
  try {
    const updatedContact= await Contact.updateMany(filter, req.body);
    res.status(200).json({
      status: "success",
      updatedContact,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteContact = async (req, res) => {
 const arr = req.params.id.split(",");
  try {
      await Contact.deleteMany({
      _id: {
        $in: [
          ...arr
        ]
      }
    });
    res.status(200).json({
      status: "success",
      deletedIds: arr
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
