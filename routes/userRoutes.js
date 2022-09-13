const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const contactRouter = require("./../routes/contactRoutes");
const router = express.Router();

router.use("/:userId/contacts", contactRouter);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router
  .route("/")
  .get(authController.restrictTo("admin"), userController.getAllUsers);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe",userController.updateMe)
router
  .route("/:id")
  .get(authController.restrictTo("admin"), userController.getUser);
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
