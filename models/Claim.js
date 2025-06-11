const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true
  },
  claimId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  claimAmount: {
    type: Number,
    required: true
  },
  claimDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', claimSchema);