const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Check if it's a Bearer token
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        // Get the token part after 'Bearer '
        const token = authHeader.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifesure_secret_key_2024');
            
            // Check if user is admin
            if (!decoded.isAdmin || decoded.role !== 'admin') {
                console.log('Non-admin access attempt:', {
                    userId: decoded.id,
                    role: decoded.role,
                    isAdmin: decoded.isAdmin
                });
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            // Add admin info to request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                isAdmin: true,
                role: 'admin'
            };

            // Log successful admin authentication
            console.log('Admin authenticated:', {
                userId: req.user.id,
                email: req.user.email
            });
            
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please login again.'
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Token verification failed'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
}; 