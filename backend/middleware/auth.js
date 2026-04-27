const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Firebase
    const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists()) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Check if user is active
    if (userData.status === 'blocked' || userData.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended or blocked',
        status: userData.status 
      });
    }

    // Attach user to request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData.role,
      fullName: userData.fullName,
      status: userData.status
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // No token, continue without user
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Firebase
    const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Attach user to request if account is active
      if (userData.status !== 'blocked' && userData.status !== 'suspended') {
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          role: userData.role,
          fullName: userData.fullName,
          status: userData.status
        };
      }
    }

    next();

  } catch (error) {
    // Invalid token, continue without user
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuth
};
