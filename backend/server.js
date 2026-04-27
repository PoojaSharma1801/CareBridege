const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import Firebase Admin
const admin = require('firebase-admin');

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const requestRoutes = require('./routes/requests');
const animalRoutes = require('./routes/animals');
const adminRoutes = require('./routes/admin');

// Initialize Express App
const app = express();

// Firebase Admin Initialization
let db, auth;

try {
  // Check if Firebase Admin environment variables are available
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token'
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
    });
    
    db = admin.firestore();
    auth = admin.auth();
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('⚠️  Firebase Admin environment variables not found - running in development mode');
    // Create mock implementations for development
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => ({}) }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve()
        }),
        add: () => Promise.resolve({ id: 'mock-id' }),
        get: () => Promise.resolve({ docs: [] }),
        where: () => ({
          get: () => Promise.resolve({ docs: [] }),
          orderBy: () => ({
            limit: () => ({
              get: () => Promise.resolve({ docs: [] })
            })
          })
        })
      })
    };
    auth = {
      verifyIdToken: () => Promise.resolve({ uid: 'mock-user' }),
      createUser: () => Promise.resolve({ uid: 'mock-user' }),
      getUser: () => Promise.resolve(null)
    };
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.log('🔄 Running in mock mode for development');
  
  // Mock implementations
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => ({}) }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [] }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] }),
        orderBy: () => ({
          limit: () => ({
            get: () => Promise.resolve({ docs: [] })
          })
        })
      })
    })
  };
  auth = {
    verifyIdToken: () => Promise.resolve({ uid: 'mock-user' }),
    createUser: () => Promise.resolve({ uid: 'mock-user' }),
    getUser: () => Promise.resolve(null)
  };
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make Firebase instances available to routes
app.use((req, res, next) => {
  req.db = db;
  req.auth = auth;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CareBridge Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔥 Firebase Connected: ${process.env.FIREBASE_PROJECT_ID}`);
});

module.exports = app;
