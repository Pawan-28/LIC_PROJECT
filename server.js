const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const adminRoutes = require('./routes/admin');
const policyRoutes = require('./routes/policy');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const app = express();
const userRoutes = require('./routes/User');
const claimRoutes = require('./routes/claim');


// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pawankumardev28:mongo@first.apbbt2s.mongodb.net/lifesure?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'lifesure_secret_key_2024';

// Make JWT_SECRET available globally
global.JWT_SECRET = JWT_SECRET;

// CORS Configuration
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const policiesDir = path.join(uploadsDir, 'policies');
if (!fs.existsSync(policiesDir)) {
  fs.mkdirSync(policiesDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/claims', claimRoutes);


// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'LifeSure API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Max size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed'
    });
  }
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: err.message 
  });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('CORS enabled for:', ['http://localhost:5174', 'http://127.0.0.1:3000', 'http://localhost:5173']);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
