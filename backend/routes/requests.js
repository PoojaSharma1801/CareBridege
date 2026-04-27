const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all donation requests
router.get('/donations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('donations').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const donationsSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const donations = [];
    donationsSnapshot.forEach(doc => {
      donations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: donations.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donation requests' });
  }
});

// Create donation request
router.post('/donations', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('donationType').isIn(['clothes', 'food', 'money', 'medical', 'school', 'other']).withMessage('Invalid donation type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('pickupLocation').notEmpty().withMessage('Pickup location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, donationType, quantity, pickupLocation, pickupInstructions, contactInfo } = req.body;

    const donation = {
      userId: req.user.uid,
      userEmail: req.user.email,
      title,
      description,
      donationType,
      quantity,
      pickupLocation,
      pickupInstructions: pickupInstructions || '',
      contactInfo: contactInfo || req.user.email,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      collectedAt: null,
      impact: {
        estimatedBeneficiaries: quantity,
        actualBeneficiaries: 0
      }
    };

    const docRef = await req.db.collection('donations').add(donation);

    // Create notification for admins
    await req.db.collection('notifications').add({
      type: 'donation_request',
      title: 'New Donation Request',
      message: `${req.user.email} wants to donate ${quantity} items (${donationType})`,
      userId: req.user.uid,
      donationId: docRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user stats
    await req.db.collection('users').doc(req.user.uid).update({
      'stats.donations': admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({
      message: 'Donation request submitted successfully',
      donationId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit donation request' });
  }
});

// Get adoption requests
router.get('/adoptions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('adoptions').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const adoptionsSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const adoptions = [];
    adoptionsSnapshot.forEach(doc => {
      adoptions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      adoptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: adoptions.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adoption requests' });
  }
});

// Create adoption request
router.post('/adoptions', [
  body('elderlyName').notEmpty().withMessage('Elderly person name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('relationship').notEmpty().withMessage('Relationship to elderly person is required'),
  body('careType').isIn(['companionship', 'medical', 'daily', 'full']).withMessage('Invalid care type'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { elderlyName, description, relationship, careType, location, availability, specialNeeds } = req.body;

    const adoption = {
      userId: req.user.uid,
      userEmail: req.user.email,
      elderlyName,
      description,
      relationship,
      careType,
      location,
      availability: availability || 'flexible',
      specialNeeds: specialNeeds || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      approvedAt: null,
      backgroundCheck: 'pending'
    };

    const docRef = await req.db.collection('adoptions').add(adoption);

    // Create notification for admins
    await req.db.collection('notifications').add({
      type: 'adoption_request',
      title: 'New Elderly Care Application',
      message: `${req.user.email} wants to adopt ${elderlyName} for care`,
      userId: req.user.uid,
      adoptionId: docRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Adoption request submitted successfully',
      adoptionId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit adoption request' });
  }
});

// Get education support requests
router.get('/education', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = req.db.collection('educationSupport').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const educationSnapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    const educationRequests = [];
    educationSnapshot.forEach(doc => {
      educationRequests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      educationRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: educationRequests.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch education requests' });
  }
});

// Create education support request
router.post('/education', [
  body('studentName').notEmpty().withMessage('Student name is required'),
  body('supportType').isIn(['tutoring', 'supplies', 'scholarship', 'mentorship']).withMessage('Invalid support type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentName, supportType, description, urgency, subject, gradeLevel, location } = req.body;

    const educationRequest = {
      userId: req.user.uid,
      userEmail: req.user.email,
      studentName,
      supportType,
      description,
      urgency,
      subject: subject || 'general',
      gradeLevel: gradeLevel || 'not specified',
      location: location || 'online',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedTo: null,
      resolvedAt: null
    };

    const docRef = await req.db.collection('educationSupport').add(educationRequest);

    // Create notification for admins
    await req.db.collection('notifications').add({
      type: 'education_request',
      title: 'New Education Support Request',
      message: `${req.user.email} is seeking ${supportType} for ${studentName}`,
      userId: req.user.uid,
      educationId: docRef.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      priority: urgency === 'high' ? 'urgent' : 'normal'
    });

    res.status(201).json({
      message: 'Education support request submitted successfully',
      educationId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit education request' });
  }
});

// Update request status (admin only)
router.put('/:type/:id', [
  body('status').isIn(['pending', 'approved', 'rejected', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('adminNotes').optional().notEmpty().withMessage('Admin notes cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;
    const { type, id } = req.params;

    // Validate request type
    const validTypes = ['donations', 'adoptions', 'education'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    const collectionName = type === 'education' ? 'educationSupport' : type;
    const requestDoc = await req.db.collection(collectionName).doc(id).get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const requestData = requestDoc.data();
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'approved') {
      updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'rejected') {
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await req.db.collection(collectionName).doc(id).update(updateData);

    // Create notification for user
    await req.db.collection('notifications').add({
      type: 'request_update',
      title: `Request ${status}`,
      message: `Your ${type.slice(0, -1)} request has been ${status}`,
      userId: requestData.userId,
      [`${type}Id`]: id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: `${type} request ${status} successfully`,
      status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get request statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all request types statistics
    const [donationsSnapshot, adoptionsSnapshot, educationSnapshot] = await Promise.all([
      req.db.collection('donations').get(),
      req.db.collection('adoptions').get(),
      req.db.collection('educationSupport').get()
    ]);

    const stats = {
      donations: {
        total: donationsSnapshot.size,
        pending: donationsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        approved: donationsSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
        completed: donationsSnapshot.docs.filter(doc => doc.data().status === 'completed').length
      },
      adoptions: {
        total: adoptionsSnapshot.size,
        pending: adoptionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        approved: adoptionsSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
        completed: adoptionsSnapshot.docs.filter(doc => doc.data().status === 'completed').length
      },
      education: {
        total: educationSnapshot.size,
        pending: educationSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        approved: educationSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
        completed: educationSnapshot.docs.filter(doc => doc.data().status === 'completed').length
      }
    };

    res.json(stats);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request statistics' });
  }
});

module.exports = router;
