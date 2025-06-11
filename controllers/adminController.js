const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Claim = require('../models/Claim');

// Register admin
exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create new admin
    admin = new Admin({
      name,
      email,
      phoneNumber,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin to database
    await admin.save();

    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (err) {
    console.error('Admin registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token with admin privileges
    const payload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isAdmin: true,
      role: 'admin'
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'lifesure_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: `Bearer ${token}`,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber
      }
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json({
      success: true,
      admin
    });
  } catch (err) {
    console.error('Get admin error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get all claims
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('userId', 'name email')
      .populate('policyId', 'title plan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Get all claims error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('policyId', 'title plan');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json({
      success: true,
      claim
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update claim status
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.adminRemarks = adminRemarks || claim.adminRemarks;
    claim.reviewedBy = req.user.id;
    claim.reviewedAt = Date.now();

    const updatedClaim = await claim.save();

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get claims statistics
exports.getClaimsStats = async (req, res) => {
  try {
    const stats = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' }
        }
      }
    ]);

    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'Pending' });
    const approvedClaims = await Claim.countDocuments({ status: 'Approved' });
    const rejectedClaims = await Claim.countDocuments({ status: 'Rejected' });
    const underReviewClaims = await Claim.countDocuments({ status: 'Under Review' });

    // Calculate total amount for all claims
    const totalAmount = await Claim.aggregate([
      { $group: { _id: null, total: { $sum: '$claimAmount' } } }
    ]).then(result => result[0]?.total || 0);

    res.json({
      success: true,
      stats: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        underReviewClaims,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Get claims stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
}; 
// Delete a claim
exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.deleteOne();

    res.json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a claim
exports.updateClaim = async (req, res) => {
  try {
    const { claimAmount, description, status, adminRemarks } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.claimAmount = claimAmount || claim.claimAmount;
    claim.description = description || claim.description;
    claim.status = status || claim.status;
    claim.adminRemarks = adminRemarks || claim.adminRemarks;
    claim.reviewedBy = req.user.id;
    claim.reviewedAt = Date.now();


    const updatedClaim = await claim.save();

    res.json({
      success: true,
      message: 'Claim updated successfully',
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
exports.createClaim = async (req, res) => {
  try {
    const { policyId, userId, claimType, claimAmount, incidentDate, description, status } = req.body;

    // Validate required fields
    if (!policyId || !userId || !claimType || !claimAmount || !incidentDate || !description || !status) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const documents = req.files ? req.files.map(file => file.path) : [];

    // Create new claim
    const newClaim = new Claim({
      policyId,
      userId,
      claimType,
      claimAmount: Number(claimAmount),
      incidentDate,
      description,
      documents,
      status,
      reviewedBy: req.user.id,
      reviewedAt: Date.now()
    });

    const savedClaim = await newClaim.save();

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: savedClaim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating claim'
    });
  }
};