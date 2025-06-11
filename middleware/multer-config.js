const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/claims',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 5 * 1024 * 1024}, // 5MB limit
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).array('documents', 10); // 'documents' is the field name, 10 is the max number of files

module.exports = upload;