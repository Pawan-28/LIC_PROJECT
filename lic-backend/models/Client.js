const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  age: Number,
  policyType: String,
  premiumAmount: Number,
  maturityDate: Date,
  documents: [String]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
