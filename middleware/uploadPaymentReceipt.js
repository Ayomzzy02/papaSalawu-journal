const { generateNewFileName, uploadToS3 } = require("../services/multer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports = catchAsync(async function (req, res, next) {
  const file = req.file; // Access the single uploaded file
  const userId = req.user.id;

  if (!file) {
    return next(new AppError("No file uploaded", 400));
  }

  try {
    const newFileName = generateNewFileName(file);
    const response = await uploadToS3({
      userId: userId,
      bucketName: process.env.S3_BUCKET_NAME,
      folderPath: process.env.S3_FOLDER_PATH,
      newFileName: newFileName,
      fileBuffer: file.buffer,
    });

    req.body.receiptUrl = response; // Store the S3 response URL in req.body
    next();
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
});
