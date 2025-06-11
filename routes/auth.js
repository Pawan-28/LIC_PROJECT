const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Get all users and admins
router.get('/', async (req, res) => {
  try {
    // Get both users and admins
    const [users, admins] = await Promise.all([
      User.find().select('-password'),
      Admin.find().select('-password')
    ]);

    // Combine and send response
    res.json([...users, ...admins]);
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'उपयोगकर्ताओं की जानकारी प्राप्त करने में त्रुटि'
    });
  }
});

module.exports = router; 