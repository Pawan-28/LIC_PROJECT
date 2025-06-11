const express = require('express');
const router = express.Router();
const cors = require('cors');
const adminController = require('../controllers/adminController');

router.use(cors());
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/multer-config');

// @route   POST /api/admin/register
// @desc    Register a new admin
// @access  Public
router.post('/register', adminController.register);

// @route   POST /api/admin/login
// @desc    Login admin
// @access  Public
router.post('/login', adminController.login);

// @route   GET /api/admin/me
// @desc    Get current admin profile
// @access  Private
router.get('/me', adminAuth, adminController.getCurrentAdmin);

// Claims Management Routes
router.get('/claims', adminAuth, adminController.getAllClaims);
router.get('/claims/stats', adminAuth, adminController.getClaimsStats);
router.get('/claims/:id', adminAuth, adminController.getClaimById);
router.patch('/claims/:id/status', adminAuth, adminController.updateClaimStatus);
router.post('/claims', adminAuth, upload, adminController.createClaim);
router.delete('/claims/:id', adminAuth, adminController.deleteClaim);
router.put('/claims/:id', adminAuth, adminController.updateClaim);

module.exports = router;