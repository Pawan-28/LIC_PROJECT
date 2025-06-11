const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter a description'],
    trim: true
  },
  plan: {
    type: String,
    required: [true, 'Please enter a plan'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Please enter a duration'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please upload an image']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  purchasedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Cancelled'],
      default: 'Active'
    }
  }]
});

module.exports = mongoose.model('Policy', policySchema);