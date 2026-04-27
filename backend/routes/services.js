const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const servicesSnapshot = await req.db.collection('services').get();
    const services = [];

    servicesSnapshot.forEach(doc => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(services);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const serviceDoc = await req.db.collection('services').doc(req.params.id).get();
    
    if (!serviceDoc.exists) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      id: serviceDoc.id,
      ...serviceDoc.data()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create new service request
router.post('/request', [
  body('serviceType').isIn(['medical', 'adoption', 'donation', 'education', 'animal']).withMessage('Invalid service type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('location').optional().notEmpty().withMessage('Location is required for certain services')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceType, title, description, priority, location, contactInfo } = req.body;

    // Create service request
    const serviceRequest = {
      userId: req.user.uid,
      userEmail: req.user.email,
      serviceType,
      title,
      description,
      priority,
      location: location || null,
      contactInfo: contactInfo || null,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      adminNotes: null,
      attachments: []
    };

    const docRef = await req.db.collection('serviceRequests').add(serviceRequest);

    // Create notification for admins
    await req.db.collection('notifications').add({
      type: 'service_request',
      title: `New ${serviceType} request`,
      message: `${req.user.email} has submitted a ${serviceType} request: ${title}`,
      userId: req.user.uid,
      requestId: docRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      priority: priority === 'high' ? 'urgent' : 'normal'
    });

    // Update user stats
    await req.db.collection('users').doc(req.user.uid).update({
      'stats.servicesUsed': admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({
      message: 'Service request submitted successfully',
      requestId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit service request' });
  }
});

// Get user's service requests
router.get('/my-requests', async (req, res) => {
  try {
    const requestsSnapshot = await req.db.collection('serviceRequests')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    requestsSnapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

// Update service request status
router.put('/request/:id', [
  body('status').isIn(['pending', 'approved', 'rejected', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('adminNotes').optional().notEmpty().withMessage('Admin notes cannot be empty if provided')
], async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const requestId = req.params.id;

    const requestDoc = await req.db.collection('serviceRequests').doc(requestId).get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    const requestData = requestDoc.data();

    // Update request
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'approved') {
      updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.approvedBy = req.user.uid;
    }

    await req.db.collection('serviceRequests').doc(requestId).update(updateData);

    // Create notification for user
    await req.db.collection('notifications').add({
      type: 'request_update',
      title: `Request ${status}`,
      message: `Your service request "${requestData.title}" has been ${status}`,
      userId: requestData.userId,
      requestId: requestId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Service request updated successfully',
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update service request' });
  }
});

// Medical Emergency - High Priority
router.post('/emergency', [
  body('patientName').notEmpty().withMessage('Patient name is required'),
  body('emergencyType').isIn(['medical', 'accident', 'other']).withMessage('Invalid emergency type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('contactPhone').isMobilePhone().withMessage('Valid contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientName, emergencyType, description, location, contactPhone, severity } = req.body;

    // Create emergency request
    const emergency = {
      userId: req.user.uid,
      userEmail: req.user.email,
      patientName,
      emergencyType,
      description,
      location,
      contactPhone,
      severity: severity || 'high',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      resolvedAt: null,
      assignedTo: null,
      responders: []
    };

    const docRef = await req.db.collection('emergencies').add(emergency);

    // Create urgent notification for all admins
    const adminSnapshot = await req.db.collection('users')
      .where('role', '==', 'admin')
      .get();

    const notifications = [];
    adminSnapshot.forEach(adminDoc => {
      notifications.push({
        type: 'emergency',
        title: '🚑 MEDICAL EMERGENCY',
        message: `Emergency reported by ${req.user.email}: ${patientName}`,
        userId: adminDoc.id,
        emergencyId: docRef.id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        priority: 'urgent'
      });
    });

    // Batch create notifications
    const batch = req.db.batch();
    notifications.forEach(notification => {
      const newNotificationRef = req.db.collection('notifications').doc();
      batch.set(newNotificationRef, notification);
    });
    await batch.commit();

    res.status(201).json({
      message: 'Emergency reported successfully',
      emergencyId: docRef.id,
      priority: 'Your emergency has been reported and help is on the way'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to report emergency' });
  }
});

// Get active emergencies (for responders)
router.get('/emergencies', async (req, res) => {
  try {
    // Check if user is admin or responder
    if (req.user.role !== 'admin' && req.user.role !== 'responder') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const emergenciesSnapshot = await req.db.collection('emergencies')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const emergencies = [];
    emergenciesSnapshot.forEach(doc => {
      emergencies.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(emergencies);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
});

// Update emergency status
router.put('/emergency/:id', [
  body('status').isIn(['active', 'responding', 'resolved', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().notEmpty().withMessage('Notes cannot be empty if provided')
], async (req, res) => {
  try {
    const { status, notes, responderId } = req.body;
    const emergencyId = req.params.id;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'responder') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const emergencyDoc = await req.db.collection('emergencies').doc(emergencyId).get();
    
    if (!emergencyDoc.exists) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (notes) {
      updateData.notes = admin.firestore.FieldValue.arrayUnion({
        text: notes,
        responderId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    if (status === 'responding') {
      updateData.responders = admin.firestore.FieldValue.arrayUnion(req.user.uid);
    }

    if (status === 'resolved') {
      updateData.resolvedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.resolvedBy = req.user.uid;
    }

    await req.db.collection('emergencies').doc(emergencyId).update(updateData);

    res.json({
      message: 'Emergency status updated successfully',
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update emergency' });
  }
});

module.exports = router;
