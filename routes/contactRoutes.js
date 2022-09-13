const express = require('express');
const contactController = require('./../controllers/contactController');
const authController = require('./../controllers/authController');
const upload = require("../utils/multer")
const router = express.Router({ mergeParams: true});

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(contactController.getAllContacts)
  .post(upload.single("image"), contactController.createContact);

router
  .route('/:id')
  .get(contactController.getContact)
  .patch(upload.single("image"), contactController.updateContact)
  .delete(contactController.deleteContact);

router.route('/updateMany/:ids').patch(contactController.updateMany)
module.exports = router;