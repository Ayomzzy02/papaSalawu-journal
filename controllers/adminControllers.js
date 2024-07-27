const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");

const {
  sendLoginDetailsEmail,
} = require("../utils/email");

//Controller for admin to add Chief-Editor
exports.addChiefEditor = catchAsync(async (req, res, next) => {

    try{
        const { email, name, department } = req.body;

        //Generate password
        const password = Math.random().toString(36).slice(-8);
        //await sendLoginDetailsEmail(name, email, password)

        console.log(password)

        //Create new Chief-Editor User
        const newUser = User.create({
          name: name,
          email: email,
          password: password,
          role: "Chief-Editor",
          department: department
        })

        if(newUser){
          return res.status(201).json({
            status: "success",
            message: `New User Created`,
          });
        }
    } catch(error) {
      return next(new AppError(`Internal Server Error: ${error}`, 500));
    }
});