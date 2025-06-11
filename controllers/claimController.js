const Claim = require('../models/Claim');

// Create a new claim
exports.createClaim = async (req, res) => {
  try {
    const {
      policyId,
      claimId,
      userName,
      claimAmount,
      claimDate,
      status,
      description
    } = req.body;

    const newClaim = new Claim({
      policyId,
      claimId,
      userName,
      claimAmount,
      claimDate,
      status,
      description
    });

    const savedClaim = await newClaim.save();

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: savedClaim
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all claims
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find();
    res.status(200).json({
      success: true,
      claims: claims
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a claim
exports.deleteClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await Claim.findByIdAndDelete(claimId);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};