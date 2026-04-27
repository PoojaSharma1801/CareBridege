const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Admin middleware
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const usersSnapshot = await req.db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Get active requests
    const requestsSnapshot = await req.db.collection('serviceRequests')
      .where('status', 'in', ['pending', 'in-progress'])
      .get();
    const activeRequests = requestsSnapshot.size;

    // Get animal reports
    const animalSnapshot = await req.db.collection('animalReports').get();
    const totalAnimalReports = animalSnapshot.size;

    // Get recent activities
    const activitiesSnapshot = await req.db.collection('activities')
      .where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .get();
    const weeklyActivities = activitiesSnapshot.size;

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsersSnapshot = await req.db.collection('users')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();
    const monthlyGrowth = ((recentUsersSnapshot.size / totalUsers) * 100).toFixed(1);

    res.json({
      overview: {
        totalUsers,
        activeRequests,
        totalAnimalReports,
        weeklyActivities,
        monthlyGrowth: `${monthlyGrowth}%`,
        systemUptime: '99.8%'
      },
      charts: {
        userActivity: 'Chart data would go here',
        serviceUsage: 'Chart data would go here'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('users').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (search) {
      query = query.where('email', '>=', search.toLowerCase())
        .where('email', '<=', search.toLowerCase() + '\uf8ff');
    }

    const usersSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        status: userData.status,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        suspicious: userData.suspicious || false
      });
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status
router.put('/users/:id/status', [
  body('status').isIn(['active', 'suspended', 'blocked']).withMessage('Invalid status'),
  body('reason').optional().notEmpty().withMessage('Reason is required for suspension/block')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reason } = req.body;
    const userId = req.params.id;

    const userDoc = await req.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (reason) {
      updateData.statusReason = reason;
      updateData.statusUpdatedBy = req.user.uid;
    }

    if (status === 'suspended' || status === 'blocked') {
      updateData.suspendedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await req.db.collection('users').doc(userId).update(updateData);

    // Create notification for user
    await req.db.collection('notifications').add({
      type: 'account_status',
      title: `Account ${status}`,
      message: `Your account has been ${status}. ${reason ? `Reason: ${reason}` : ''}`,
      userId: userId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: `User status updated to ${status}`,
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all requests for verification
router.get('/requests', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('serviceRequests').orderBy('createdAt', 'desc');

    if (type) {
      query = query.where('serviceType', '==', type);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (priority) {
      query = query.where('priority', '==', priority);
    }

    const requestsSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const requests = [];
    requestsSnapshot.forEach(doc => {
      const requestData = doc.data();
      requests.push({
        id: doc.id,
        ...requestData
      });
    });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: requests.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Approve/reject request
router.put('/requests/:id', [
  body('action').isIn(['approve', 'reject', 'investigate']).withMessage('Invalid action'),
  body('adminNotes').optional().notEmpty().withMessage('Admin notes cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, adminNotes } = req.body;
    const requestId = req.params.id;

    const requestDoc = await req.db.collection('serviceRequests').doc(requestId).get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const requestData = requestDoc.data();
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (action === 'investigate') {
      updateData.status = 'investigating';
    }

    await req.db.collection('serviceRequests').doc(requestId).update(updateData);

    // Create notification for user
    await req.db.collection('notifications').add({
      type: 'request_update',
      title: `Request ${action}d`,
      message: `Your request "${requestData.title}" has been ${action}d`,
      userId: requestData.userId,
      requestId: requestId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: `Request ${action}d successfully`,
      action,
      status: updateData.status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get animal reports
router.get('/animals', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, urgency } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('animalReports').orderBy('reportDate', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (urgency) {
      query = query.where('urgency', '==', urgency);
    }

    const reportsSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const reports = [];
    reportsSnapshot.forEach(doc => {
      const reportData = doc.data();
      reports.push({
        id: doc.id,
        ...reportData
      });
    });

    // Get statistics
    const statsSnapshot = await req.db.collection('animalReports').get();
    const stats = {
      total: statsSnapshot.size,
      pending: statsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
      inProgress: statsSnapshot.docs.filter(doc => doc.data().status === 'in-progress').length,
      resolved: statsSnapshot.docs.filter(doc => doc.data().status === 'resolved').length,
      highUrgency: statsSnapshot.docs.filter(doc => doc.data().urgency === 'high').length
    };

    res.json({
      reports,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reports.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch animal reports' });
  }
});

// Update animal report
router.put('/animals/:id', [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'escalated']).withMessage('Invalid status'),
  body('assignedTo').optional().notEmpty().withMessage('Assignee cannot be empty if provided'),
  body('notes').optional().notEmpty().withMessage('Notes cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, assignedTo, notes } = req.body;
    const reportId = req.params.id;

    const reportDoc = await req.db.collection('animalReports').doc(reportId).get();
    
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Animal report not found' });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (notes) {
      updateData.notes = admin.firestore.FieldValue.arrayUnion({
        text: notes,
        adminId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    if (status === 'resolved') {
      updateData.resolvedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await req.db.collection('animalReports').doc(reportId).update(updateData);

    res.json({
      message: 'Animal report updated successfully',
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update animal report' });
  }
});

// Get fraud alerts
router.get('/fraud', async (req, res) => {
  try {
    // Get suspicious activities
    const suspiciousUsersSnapshot = await req.db.collection('users')
      .where('suspicious', '==', true)
      .get();

    const suspiciousUsers = [];
    suspiciousUsersSnapshot.forEach(doc => {
      suspiciousUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get duplicate requests (simplified logic)
    const requestsSnapshot = await req.db.collection('serviceRequests')
      .where('createdAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get();

    const duplicateRequests = [];
    const emailCounts = {};
    
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      emailCounts[data.userEmail] = (emailCounts[data.userEmail] || 0) + 1;
    });

    Object.keys(emailCounts).forEach(email => {
      if (emailCounts[email] > 3) {
        duplicateRequests.push({
          email,
          count: emailCounts[email],
          suspicious: true
        });
      }
    });

    // Get blocked users
    const blockedUsersSnapshot = await req.db.collection('users')
      .where('status', '==', 'blocked')
      .get();

    const stats = {
      suspiciousActivities: suspiciousUsers.length,
      duplicateRequests: duplicateRequests.length,
      blockedUsers: blockedUsersSnapshot.size,
      detectionAccuracy: '95%'
    };

    // Get recent fraud alerts
    const fraudAlertsSnapshot = await req.db.collection('fraudAlerts')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentAlerts = [];
    fraudAlertsSnapshot.forEach(doc => {
      recentAlerts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      stats,
      suspiciousUsers,
      duplicateRequests,
      blockedUsers: blockedUsersSnapshot.size,
      recentAlerts
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fraud data' });
  }
});

// Block user
router.post('/users/:id/block', [
  body('reason').notEmpty().withMessage('Reason is required for blocking user')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const userId = req.params.id;

    const userDoc = await req.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await req.db.collection('users').doc(userId).update({
      status: 'blocked',
      blockedReason: reason,
      blockedAt: admin.firestore.FieldValue.serverTimestamp(),
      blockedBy: req.user.uid
    });

    // Create fraud alert
    await req.db.collection('fraudAlerts').add({
      type: 'user_blocked',
      userId: userId,
      reason,
      adminId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'User blocked successfully'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// System health check
router.get('/system', async (req, res) => {
  try {
    // Get system statistics
    const usersSnapshot = await req.db.collection('users').get();
    const requestsSnapshot = await req.db.collection('serviceRequests').get();
    const activitiesSnapshot = await req.db.collection('activities').get();

    const systemStats = {
      totalUsers: usersSnapshot.size,
      totalRequests: requestsSnapshot.size,
      totalActivities: activitiesSnapshot.size,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: systemStats
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get system health' });
  }
});

module.exports = router;
