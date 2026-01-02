import multer from 'multer';
import path from 'path';
// Set up storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/photos/'); // Directory to store uploaded images
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB file size limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('photo'); // 'profileImage' is the field name for the uploaded file

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

export default upload;
