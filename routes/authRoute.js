const express = require("express");
const router = express.Router();

const {
  signInUser,
  signUpUser,
} = require("../controllers/authControllers");

const {
  ValidateUserAccountByEmail,
} = require("../middleware/user");
const catchAsync = require("../utils/catchAsync");

router.post(
  "/signin",
  catchAsync(ValidateUserAccountByEmail),
  signInUser
);

router.post("/signup", signUpUser);

module.exports = router;