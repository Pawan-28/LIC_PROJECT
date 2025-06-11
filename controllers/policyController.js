const Policy = require('../models/Policy');
const fs = require('fs');
const path = require('path');
const Claim = require('../models/Claim');

// Create a new policy
exports.createPolicy = async (req, res) => {
  try {
    const { title, description, plan, duration } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/policies/${req.file.filename}`;
    }

    const policy = new Policy({
      title,
      description,
      plan,
      duration,
      imageUrl,
      createdBy: req.user.id,
    });

    await policy.save();

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policy
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all policies
exports.getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    
    // If user is logged in, add isPurchased and hasClaim flags
    if (req.user) {
      // Get all claims for this user
      const userClaims = await Claim.find({ userId: req.user.id });
      const claimedPolicyIds = userClaims.map(claim => claim.policyId.toString());

      const policiesWithStatus = policies.map(policy => {
        const isPurchased = policy.purchasedBy.some(
          purchase => purchase.userId.toString() === req.user.id && purchase.status === 'Active'
        );
        const hasClaim = claimedPolicyIds.includes(policy._id.toString());
        
        return {
          ...policy.toObject(),
          isPurchased,
          hasClaim
        };
      });

      return res.json({
        success: true,
        policies: policiesWithStatus
      });
    }

    res.json({
      success: true,
      policies
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single policy
exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update policy
exports.updatePolicy = async (req, res) => {
  try {
    let policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const { title, description, plan, duration } = req.body;
    let imageUrl = policy.imageUrl;

    if (req.file) {
      // Delete old image if exists
      if (policy.imageUrl) {
        const oldImagePath = policy.imageUrl.split('/uploads/')[1];
        const fullPath = path.join(__dirname, '../uploads', oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/policies/${req.file.filename}`;
    }

    policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { title, description, plan, duration, imageUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Policy updated successfully',
      policy
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Delete image if exists
    if (policy.imageUrl) {
      const imagePath = policy.imageUrl.split('/uploads/')[1];
      const fullPath = path.join(__dirname, '../uploads', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await policy.deleteOne();

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Purchase policy
exports.purchasePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ 
        success: false,
        message: 'Policy not found' 
      });
    }

    // Check if user already has an active policy
    const existingPurchase = policy.purchasedBy.find(
      purchase => purchase.userId.toString() === req.user.id && purchase.status === 'Active'
    );

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active policy'
      });
    }

    // Add purchase
    policy.purchasedBy.push({
      userId: req.user.id,
      purchaseDate: new Date(),
      status: 'Active'
    });

    await policy.save();

    res.json({
      success: true,
      message: 'Policy purchased successfully',
      policy
    });
  } catch (error) {
    console.error('Purchase policy error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get user's purchased policies
exports.getUserPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({
      'purchasedBy.userId': req.user.id,
      'purchasedBy.status': 'Active'
    });

    res.json({
      success: true,
      policies
    });
  } catch (error) {
    console.error('Get user policies error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Buy a policy
exports.buyPolicy = async (req, res) => {
    try {
        const policyId = req.params.id;
        const userId = req.user.id;

        const policy = await Policy.findById(policyId);
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // Check if user has already purchased this policy
        const alreadyPurchased = policy.purchasedBy.some(purchase => 
            purchase.userId.toString() === userId && purchase.status === 'Active'
        );

        if (alreadyPurchased) {
            return res.status(400).json({
                success: false,
                message: 'You have already purchased this policy'
            });
        }

        // Add user to purchasedBy array
        policy.purchasedBy.push({
            userId: userId,
            purchaseDate: new Date(),
            status: 'Active'
        });

        await policy.save();

        res.json({
            success: true,
            message: 'Policy purchased successfully',
            policy
        });
    } catch (error) {
        console.error('Buy policy error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single policy details
exports.getPolicyDetails = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);
        
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.json({
            success: true,
            policy
        });
    } catch (error) {
        console.error('Get policy details error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 