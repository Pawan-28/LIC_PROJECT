const express = require('express');
const router = express.Router();
const { createClaim, getAllClaims, deleteClaim } = require('../controllers/claimController.js');

// Create a new claim
router.post('/create', createClaim);
// Get all claims
router.get('/', getAllClaims);
// Delete a claim
router.delete('/:id', deleteClaim);

module.exports = router;