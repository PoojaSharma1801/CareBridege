const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation Rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register User
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, phone } = req.body;

    // Check if user already exists
    const userSnapshot = await req.db.collection('users').where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine if admin
    const isAdmin = email.includes('admin') || email === 'admin@carebridge.org';

    // Create user in Firebase
    const userRecord = await req.auth.createUser({
      email: email,
      password: password,
      displayName: fullName,
      phoneNumber: phone || null
    });

    // Store additional user data in Firestore
    const userData = {
      uid: userRecord.uid,
      email: email,
      fullName: fullName,
      phone: phone || null,
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        avatar: null,
        bio: null,
        location: null
      },
      stats: {
        servicesUsed: 0,
        donations: 0,
        volunteerHours: 0,
        impactScore: 0
      }
    };

    await req.db.collection('users').doc(userRecord.uid).set(userData);

    // Generate JWT
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: email, 
        role: isAdmin ? 'admin' : 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: isAdmin ? 'Admin account created successfully!' : 'User registered successfully!',
      token,
      user: {
        uid: userRecord.uid,
        email: email,
        fullName: fullName,
        role: isAdmin ? 'admin' : 'user'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Login User
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from Firestore
    const userSnapshot = await req.db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password (in production, you'd verify against stored hash)
    // For this demo, we'll accept any password for simplicity
    // const isValidPassword = await bcrypt.compare(password, userData.password);

    // Generate JWT
    const token = jwt.sign(
      { 
        uid: userData.uid, 
        email: userData.email, 
        role: userData.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Update last login
    await req.db.collection('users').doc(userData.uid).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: userData.role === 'admin' ? 'Admin login successful!' : 'Login successful!',
      token,
      user: {
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Verify Token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Firestore
    const userDoc = await req.db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    res.json({
      valid: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role
      }
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout (Firebase)
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Revoke all user tokens (optional, implement refresh tokens for better security)
      await req.auth.revokeRefreshTokens(decoded.uid);
    }

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Password Reset Request
router.post('/reset-request', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const userSnapshot = await req.db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (in production, send email)
    const resetToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    await req.db.collection('passwordResets').add({
      email: email,
      token: resetToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      used: false
    });

    res.json({ 
      message: 'Password reset instructions sent to your email',
      // In development, return token for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    res.status(500).json({ error: 'Reset request failed' });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is valid and unused
    const resetSnapshot = await req.db.collection('passwordResets')
      .where('email', '==', decoded.email)
      .where('token', '==', token)
      .where('used', '==', false)
      .get();

    if (resetSnapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update user password in Firebase Auth
    await req.auth.updateUser(decoded.uid, { password: password });

    // Mark token as used
    const resetDoc = resetSnapshot.docs[0];
    await req.db.collection('passwordResets').doc(resetDoc.id).update({ used: true });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;
