const uuid = require("uuid");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

const AppError = require("../utils/appError");

//configure Multer to use MemoryStorage
const storage = multer.memoryStorage();

exports.upload = multer({
    storage: storage, 
    fileFilter: (req, file, cb) => {
      //Allowed file type
      const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
  
      if (allowedMimes.includes(file.mimetype)) {
        console.log('Hello World')
        console.log(file.mimetype)
        cb(null, true);
      } else {
        cb(
          new AppError(
            "Invalid File type. Only JPEG, PNG, and GIF are allowed",
            400
          )
        );
      }
    },
    limits: {
      fileSize: 100 * 1024 * 1024,
    }
});
  
const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})


exports.uploadToS3 = async function ({
  userId,
  bucketName,
  folderPath,
  newFileName,
  fileBuffer,
}) {

  const uploadParams = {
    Bucket: bucketName,
    Key: `${folderPath}${userId}/${newFileName}`,
    Body: fileBuffer,
  };

  const command = new PutObjectCommand(uploadParams)

  try {
    const s3Response = await s3.send(command)
    return uploadParams.Key
  } catch (error) {
    return res.status(500).json({
        status: "failed",
        message: error.message,
    });
  }
};

exports.generateNewFileName = (file) => {
  const randomString = uuid.v4();
  const fileExtension = file.originalname.split(".").pop();
  return `${randomString}.${fileExtension}`;
};
