const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('Authorization');
    
    // Check if token exists and has Bearer prefix
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token or invalid token format, authorization denied'
      });
    }

    // Remove Bearer prefix
    token = token.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifesure_secret_key_2024');
      
      // Add user data to request
      req.user = {
        userId: decoded.userId || decoded.user?.id || decoded.admin?.id,
        role: decoded.role || 'user'
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};