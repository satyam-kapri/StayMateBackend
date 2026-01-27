import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // 1. GET USER ID FROM REQUEST
    // This assumes you have auth middleware that sets req.user or req.userId
    const userId = req.user ? req.user.userId : "anonymous";

    // 2. CREATE DYNAMIC PATH
    // Path: users/101/photo-1709...jpg
    let fileName;
    if (file.fieldname === "photo")
      fileName = `users/${userId}/${file.fieldname}-${Date.now()}${path.extname(
        file.originalname,
      )}`;
    else fileName = `users/${userId}/${file.fieldname}`;

    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass a specific error message we can catch later
    cb(new Error("INVALID_FILE_TYPE"));
  }
};
export const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter,
}).single("photo");
export const uploadIDFront = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter,
}).single("idFront");

export const uploadIDBack = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter,
}).single("idBack");

export const uploadSelfie = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter,
}).single("selfie");

export const handleUpload = (middleware) => {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      // Case A: File too large (Multer standard error)
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File is too large. Max limit is 5MB.",
        });
      }

      // Case B: Invalid File Type (Our custom error)
      if (err && err.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({
          success: false,
          message: "Only JPG, JPEG, and PNG files are allowed.",
        });
      }

      // Case C: Other Errors (AWS errors, etc)
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Upload failed: " + err.message,
        });
      }

      // Success
      next();
    });
  };
};
