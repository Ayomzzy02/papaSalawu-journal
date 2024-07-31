const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Journal = require("../models/Journal");

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

exports.addReviewer = catchAsync(async function (req, res, next) {
  try{
    const { email, name, department, anonymousName } = req.body;

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({
        status: "failed",
        message: "User with email already exists.",
      });
    }
    
    //Generate password
    const password = Math.random().toString(36).slice(-8);
    //await sendLoginDetailsEmail(name, email, password)

    console.log(password)

    //Create new Chief-Editor User
    const newUser = User.create({
      name: name,
      email: email,
      anonymousName: anonymousName,
      password: password,
      role: "Reviewer",
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


exports.verifyPayment = catchAsync(async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Find the payment document by transactionId and update its status to 'Paid'
    const payment = await Payment.findOneAndUpdate(
      { transactionId: transactionId },
      { status: 'Paid' },
      { new: true }
    );

    // Get the articleId from the payment document
    const { article } = payment;

    const journal = await Journal.findByIdAndUpdate(
      article.toString(),
      { status: 'Published' },
      { new: true }
    );


    if (!payment || !journal) {
      return next(new AppError('Error Verifying Payment', 400));
    }

    console.log('Successfully')
    res.status(200).json({
      status: 'success',
      message: "Payment Verified"
    });
  } catch (error) {
    return next(new AppError(`Internal Server Error: ${error}`, 500));
  }
});

exports.getPayments = catchAsync(async (req, res, next) => {
  try{
    const status = req.query.status;

    // Validate the status query parameter
    if (!status || !['Pending', 'Paid'].includes(status)) {
      return next(new AppError('Invalid status query parameter', 400));
    }

    // Fetch payments based on the status
    const payments = await Payment.find({ status });

    res.status(200).json({
      status: 'success',
      data: {
        payments
      }
    });
  } catch(error) {
    return next(new AppError(`Internal Server Error: ${error}`, 500));
  }
});