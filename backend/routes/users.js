const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userDoc = await req.db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Remove sensitive information
    const { password, ...safeUserData } = userData;

    res.json(safeUserData);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().isLength({ max: 200 }).withMessage('Location must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phone, bio, location } = req.body;
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (location !== undefined) updateData['profile.location'] = location;

    await req.db.collection('users').doc(req.user.uid).update(updateData);

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', async (req, res) => {
  try {
    // This would typically use multer for file uploads
    // For now, return a placeholder response
    res.json({
      message: 'Avatar upload endpoint',
      note: 'Implement file upload with multer and cloud storage'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get user activities
router.get('/activities', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const activitiesSnapshot = await req.db.collection('activities')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const activities = [];
    activitiesSnapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      activities,
      hasMore: activities.length === parseInt(limit)
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add user activity
router.post('/activities', [
  body('type').isIn(['service', 'donation', 'volunteer', 'emergency']).withMessage('Invalid activity type'),
  body('service').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('impact').optional().notEmpty().withMessage('Impact description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, service, description, impact, metadata = {} } = req.body;

    const activity = {
      userId: req.user.uid,
      userEmail: req.user.email,
      type,
      service,
      description,
      impact: impact || 'Community contribution',
      metadata,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5)
    };

    const docRef = await req.db.collection('activities').add(activity);

    // Update user stats
    const statsUpdate = {};
    if (type === 'service') statsUpdate['stats.servicesUsed'] = admin.firestore.FieldValue.increment(1);
    if (type === 'donation') statsUpdate['stats.donations'] = admin.firestore.FieldValue.increment(1);
    if (type === 'volunteer') statsUpdate['stats.volunteerHours'] = admin.firestore.FieldValue.increment(1);
    
    statsUpdate['stats.impactScore'] = admin.firestore.FieldValue.increment(1);

    await req.db.collection('users').doc(req.user.uid).update(statsUpdate);

    res.status(201).json({
      message: 'Activity recorded successfully',
      activityId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userDoc = await req.db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const stats = userData.stats || {};

    // Get additional stats from activities
    const activitiesSnapshot = await req.db.collection('activities')
      .where('userId', '==', req.user.uid)
      .get();

    const activitiesByType = {
      service: 0,
      donation: 0,
      volunteer: 0,
      emergency: 0
    };

    activitiesSnapshot.forEach(doc => {
      const activity = doc.data();
      activitiesByType[activity.type] = (activitiesByType[activity.type] || 0) + 1;
    });

    res.json({
      ...stats,
      activitiesByType,
      totalActivities: activitiesSnapshot.size,
      joinDate: userData.createdAt,
      lastLogin: userData.lastLogin
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;

    let query = req.db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (unreadOnly === 'true') {
      query = query.where('read', '==', false);
    }

    const notificationsSnapshot = await query.get();

    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;

    await req.db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    // This would typically require password confirmation
    // Delete user from Firebase Auth
    await req.auth.deleteUser(req.user.uid);

    // Delete user data from Firestore
    await req.db.collection('users').doc(req.user.uid).delete();
    
    // Delete user's activities, requests, etc.
    const collectionsToDelete = ['activities', 'serviceRequests', 'notifications'];
    
    for (const collectionName of collectionsToDelete) {
      const snapshot = await req.db.collection(collectionName)
        .where('userId', '==', req.user.uid)
        .get();
      
      const batch = req.db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Search users (admin only)
router.get('/search', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const usersSnapshot = await req.db.collection('users')
      .where('email', '>=', q.toLowerCase())
      .where('email', '<=', q.toLowerCase() + '\uf8ff')
      .limit(parseInt(limit))
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        status: userData.status,
        createdAt: userData.createdAt
      });
    });

    res.json({ users });

  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
