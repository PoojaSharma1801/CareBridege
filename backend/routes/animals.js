const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all animal reports
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, urgency, animalType } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('animalReports').orderBy('reportDate', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (urgency) {
      query = query.where('urgency', '==', urgency);
    }

    if (animalType) {
      query = query.where('animalType', '==', animalType.toLowerCase());
    }

    const reportsSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      reports,
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

// Create animal report
router.post('/reports', [
  body('animalType').notEmpty().withMessage('Animal type is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level'),
  body('contactName').notEmpty().withMessage('Contact name is required'),
  body('contactPhone').isMobilePhone().withMessage('Valid contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      animalType, 
      location, 
      description, 
      urgency, 
      contactName, 
      contactPhone, 
      estimatedAge,
      condition,
      immediateDanger = false
    } = req.body;

    const report = {
      userId: req.user.uid,
      userEmail: req.user.email,
      animalType: animalType.toLowerCase(),
      location,
      description,
      urgency,
      contactName,
      contactPhone,
      estimatedAge: estimatedAge || 'unknown',
      condition: condition || 'unknown',
      immediateDanger,
      status: 'pending',
      reportDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      assignedAt: null,
      resolvedAt: null,
      images: [],
      videos: []
    };

    const docRef = await req.db.collection('animalReports').add(report);

    // Create urgent notification for high urgency reports
    if (urgency === 'high') {
      const adminSnapshot = await req.db.collection('users')
        .where('role', '==', 'admin')
        .get();

      const notifications = [];
      adminSnapshot.forEach(adminDoc => {
        notifications.push({
          type: 'animal_emergency',
          title: '🐾 URGENT: Animal Emergency',
          message: `High urgency animal report: ${animalType} at ${location}`,
          userId: adminDoc.id,
          reportId: docRef.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          priority: 'urgent'
        });
      });

      const batch = req.db.batch();
      notifications.forEach(notification => {
        const newNotificationRef = req.db.collection('notifications').doc();
        batch.set(newNotificationRef, notification);
      });
      await batch.commit();
    }

    // Create regular notification
    await req.db.collection('notifications').add({
      type: 'animal_report',
      title: 'New Animal Report',
      message: `${req.user.email} reported a ${animalType} at ${location}`,
      userId: req.user.uid,
      reportId: docRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Animal report submitted successfully',
      reportId: docRef.id,
      priority: urgency === 'high' ? 'Your report has been marked as high priority and will be handled immediately' : 'Your report has been submitted and will be reviewed'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit animal report' });
  }
});

// Update animal report
router.put('/reports/:id', [
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
      updateData.assignedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    if (notes) {
      updateData.notes = admin.firestore.FieldValue.arrayUnion({
        text: notes,
        responderId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    if (status === 'in-progress') {
      updateData.startedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'resolved') {
      updateData.resolvedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.resolvedBy = req.user.uid;
    } else if (status === 'escalated') {
      updateData.escalatedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.escalatedBy = req.user.uid;
    }

    await req.db.collection('animalReports').doc(reportId).update(updateData);

    // Create notification for reporter
    const reportData = reportDoc.data();
    await req.db.collection('notifications').add({
      type: 'report_update',
      title: 'Animal Report Update',
      message: `Your animal report has been ${status}`,
      userId: reportData.userId,
      reportId: reportId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Animal report updated successfully',
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update animal report' });
  }
});

// Get animal rescue teams
router.get('/teams', async (req, res) => {
  try {
    const teamsSnapshot = await req.db.collection('rescueTeams').get();
    
    const teams = [];
    teamsSnapshot.forEach(doc => {
      teams.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(teams);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rescue teams' });
  }
});

// Create rescue team
router.post('/teams', [
  body('teamName').notEmpty().withMessage('Team name is required'),
  body('leaderName').notEmpty().withMessage('Leader name is required'),
  body('contactEmail').isEmail().withMessage('Valid email is required'),
  body('contactPhone').isMobilePhone().withMessage('Valid phone is required'),
  body('specialties').isArray().withMessage('Specialties must be an array'),
  body('serviceArea').notEmpty().withMessage('Service area is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      teamName, 
      leaderName, 
      contactEmail, 
      contactPhone, 
      specialties, 
      serviceArea,
      description,
      availability
    } = req.body;

    const team = {
      teamName,
      leaderName,
      contactEmail,
      contactPhone,
      specialties,
      serviceArea,
      description: description || '',
      availability: availability || '24/7',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        totalRescues: 0,
        successfulRescues: 0,
        averageResponseTime: 0
      }
    };

    const docRef = await req.db.collection('rescueTeams').add(team);

    res.status(201).json({
      message: 'Rescue team created successfully',
      teamId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to create rescue team' });
  }
});

// Assign team to report
router.put('/reports/:id/assign', [
  body('teamId').notEmpty().withMessage('Team ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teamId, priority } = req.body;
    const reportId = req.params.id;

    // Verify team exists
    const teamDoc = await req.db.collection('rescueTeams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Rescue team not found' });
    }

    // Update report
    await req.db.collection('animalReports').doc(reportId).update({
      assignedTo: teamId,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'in-progress',
      priority: priority || 'medium'
    });

    // Update team stats
    await req.db.collection('rescueTeams').doc(teamId).update({
      'stats.totalRescues': admin.firestore.FieldValue.increment(1)
    });

    // Create notification for team
    const teamData = teamDoc.data();
    await req.db.collection('notifications').add({
      type: 'assignment',
      title: 'New Assignment',
      message: `You have been assigned to an animal rescue case`,
      userId: teamData.leaderId || teamId,
      teamId: teamId,
      reportId: reportId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Team assigned successfully'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to assign team' });
  }
});

// Get animal statistics
router.get('/stats', async (req, res) => {
  try {
    const reportsSnapshot = await req.db.collection('animalReports').get();
    const teamsSnapshot = await req.db.collection('rescueTeams').get();

    const stats = {
      totalReports: reportsSnapshot.size,
      statusBreakdown: {
        pending: reportsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        inProgress: reportsSnapshot.docs.filter(doc => doc.data().status === 'in-progress').length,
        resolved: reportsSnapshot.docs.filter(doc => doc.data().status === 'resolved').length,
        escalated: reportsSnapshot.docs.filter(doc => doc.data().status === 'escalated').length
      },
      urgencyBreakdown: {
        low: reportsSnapshot.docs.filter(doc => doc.data().urgency === 'low').length,
        medium: reportsSnapshot.docs.filter(doc => doc.data().urgency === 'medium').length,
        high: reportsSnapshot.docs.filter(doc => doc.data().urgency === 'high').length
      },
      animalTypeBreakdown: {},
      totalTeams: teamsSnapshot.size,
      activeTeams: teamsSnapshot.docs.filter(doc => doc.data().status === 'active').length
    };

    // Calculate animal type breakdown
    reportsSnapshot.forEach(doc => {
      const animalType = doc.data().animalType;
      stats.animalTypeBreakdown[animalType] = (stats.animalTypeBreakdown[animalType] || 0) + 1;
    });

    res.json(stats);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch animal statistics' });
  }
});

// Get nearby rescue resources
router.get('/resources', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // This would typically use geospatial queries
    // For now, return all resources
    const resourcesSnapshot = await req.db.collection('rescueResources').get();
    
    const resources = [];
    resourcesSnapshot.forEach(doc => {
      resources.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      resources,
      center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radius: parseFloat(radius)
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rescue resources' });
  }
});

module.exports = router;
