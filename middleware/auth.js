const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

exports.authenticate = catchAsync(async (req, res, next) => {
  let token;
  // Check if a Bearer Token is present in the request header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({
      error: "You are not logged in. Please login to gain access",
    });
  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Checks if User with id claim still exists
  const claimUser = await User.findById(decoded.id);
  if (!claimUser)
    return res.status(401).json({
        error: "User associated with token no longer exists!",
      });
  // Grants Access!
  req.user = claimUser;
  next();
});