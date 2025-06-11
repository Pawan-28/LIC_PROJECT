const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const policyController = require('../controllers/policyController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/policies';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Create a new policy - Protected route (Admin only)
router.post('/', adminAuth, upload.single('image'), policyController.createPolicy);

// Get all policies - Public route
router.get('/', policyController.getPolicies);

// Get user's purchased policies - Protected route
router.get('/my-policies', auth, policyController.getUserPolicies);

// Purchase a policy - Protected route
router.post('/:id/purchase', auth, policyController.purchasePolicy);

// Get single policy - Public route
router.get('/:id', policyController.getPolicy);

// Update policy - Protected route (Admin only)
router.put('/:id', adminAuth, upload.single('image'), policyController.updatePolicy);

// Delete policy - Protected route (Admin only)
router.delete('/:id', adminAuth, policyController.deletePolicy);

module.exports = router;
