const AppError = require("../utils/appError");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { getSignedToken } = require("../services/jwt");

const authenticateResponse = async function (
  user,
  statusCode,
  res,
  req,
) {
  const token = getSignedToken(user._id);
  user.password = undefined; // so the password won't be part of the output

  res.cookie('token', token, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
    httpOnly: true,
    path: '/', // Specify the path where the cookie is available
    domain: 'nijetunilorin.com',
  });

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};


exports.signInUser = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  // Finds user and compare password
  const user = req.user;
 if (!(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "failed",
      message: `Password not correct!`,
    });
  }

    authenticateResponse(user, 200, res, req);
});


exports.signUpUser = catchAsync(async (req, res, next) => { 
  try {
    const { name, email, password } = req.body; 
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({
        status: "failed",
        message: "User with email already exists.",
      });
    }

    const domainWord = email.split('@')[1].split('.')[0]; // Extract the word after '@' and before the first '.'
    const adminWord = process.env.SECRET_ID; // The word from the environment variable
    const adminPassword = process.env.SECRET_KEY; // The password from the environment variable

    let userRole = "Author";
    let userPassword = password;

    if (domainWord === adminWord) {
      userRole = "Admin";
      userPassword = adminPassword;
    }

    const user = await User.create({
      name,
      email,
      password: userPassword,
      role: userRole,
    });

    return res.status(201).json({
      status: "success",
      message: `${name}, Hurray! You've Successfully Registered`,
    });
  } catch (error) {
    return next(new AppError("Something went terribly wrong. Please try again later", 400));
  }
});