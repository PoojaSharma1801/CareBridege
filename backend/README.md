# CareBridge Backend API

A comprehensive backend API for the CareBridge healthcare platform, built with Node.js, Express, and Firebase.

## 🚀 Features

### **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (User/Admin)
- Password reset functionality
- Email verification
- Account management

### **User Management**
- User registration and login
- Profile management
- Activity tracking
- Statistics and analytics
- Account status management

### **Service Requests**
- Medical emergency requests
- Donation management
- Elderly adoption applications
- Education support requests
- Request verification workflow

### **Animal Welfare**
- Animal rescue reporting
- Rescue team management
- Assignment system
- Resource tracking
- Statistics and monitoring

### **Admin Controls**
- User management dashboard
- Request approval/rejection
- Fraud detection
- System monitoring
- Analytics and reporting

## 📁 Project Structure

```
backend/
├── package.json          # Dependencies and scripts
├── .env                 # Environment variables
├── server.js             # Main server file
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management
│   ├── services.js      # Service requests
│   ├── requests.js      # Donation/Adoption/Education
│   ├── animals.js       # Animal welfare
│   └── admin.js         # Admin controls
├── middleware/          # Custom middleware
│   └── auth.js         # Authentication middleware
└── README.md           # This file
```

## 🛠 Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🔥 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project: `carebridge-healthcare`

2. **Generate Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download JSON file

3. **Update Environment Variables**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   ```

## 📡 API Endpoints

### **Authentication**
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/verify           # Token verification
POST /api/auth/logout            # User logout
POST /api/auth/reset-request     # Password reset request
POST /api/auth/reset-password    # Password reset
```

### **Users**
```
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update user profile
POST   /api/users/avatar         # Upload avatar
GET    /api/users/activities     # Get user activities
POST   /api/users/activities     # Add user activity
GET    /api/users/stats          # Get user statistics
GET    /api/users/notifications # Get notifications
PUT    /api/users/notifications/:id/read # Mark notification read
DELETE /api/users/account       # Delete account
GET    /api/users/search         # Search users (admin)
```

### **Services**
```
GET    /api/services/                    # Get all services
GET    /api/services/:id                 # Get service by ID
POST   /api/services/request              # Create service request
GET    /api/services/my-requests          # Get user's requests
PUT    /api/services/request/:id          # Update request status
POST   /api/services/emergency             # Report emergency
GET    /api/services/emergencies           # Get active emergencies
PUT    /api/services/emergency/:id         # Update emergency status
```

### **Requests**
```
GET    /api/requests/donations          # Get donation requests
POST   /api/requests/donations          # Create donation request
GET    /api/requests/adoptions           # Get adoption requests
POST   /api/requests/adoptions           # Create adoption request
GET    /api/requests/education           # Get education requests
POST   /api/requests/education           # Create education request
PUT    /api/requests/:type/:id          # Update request status
GET    /api/requests/stats              # Get request statistics
```

### **Animals**
```
GET    /api/animals/reports              # Get animal reports
POST   /api/animals/reports              # Create animal report
PUT    /api/animals/reports/:id          # Update report status
GET    /api/animals/teams               # Get rescue teams
POST   /api/animals/teams               # Create rescue team
PUT    /api/animals/reports/:id/assign   # Assign team to report
GET    /api/animals/stats               # Get animal statistics
GET    /api/animals/resources           # Get rescue resources
```

### **Admin**
```
GET    /api/admin/dashboard              # Admin dashboard stats
GET    /api/admin/users                  # Get all users
PUT    /api/admin/users/:id/status       # Update user status
GET    /api/admin/requests               # Get all requests
PUT    /api/admin/requests/:id           # Approve/reject request
GET    /api/admin/animals                # Get animal reports
PUT    /api/admin/animals/:id            # Update animal report
GET    /api/admin/fraud                  # Get fraud alerts
POST   /api/admin/users/:id/block        # Block user
GET    /api/admin/system                 # System health check
```

## 🔒 Security Features

### **Authentication Security**
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Token expiration management
- Secure password reset

### **API Security**
- CORS configuration
- Helmet.js for security headers
- Input validation with express-validator
- SQL injection prevention
- XSS protection

### **Firebase Security**
- Firebase Admin SDK for server-side operations
- Secure Firestore rules (client-side)
- User authentication through Firebase Auth
- Role-based access control

## 📊 Database Schema

### **Users Collection**
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email
  fullName: string,       // Full name
  phone: string,         // Phone number (optional)
  role: string,          // 'user' | 'admin'
  status: string,         // 'active' | 'suspended' | 'blocked'
  profile: {
    avatar: string,
    bio: string,
    location: string
  },
  stats: {
    servicesUsed: number,
    donations: number,
    volunteerHours: number,
    impactScore: number
  },
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### **Service Requests Collection**
```javascript
{
  userId: string,
  userEmail: string,
  serviceType: string,    // 'medical' | 'adoption' | 'donation' | 'education'
  title: string,
  description: string,
  priority: string,       // 'low' | 'medium' | 'high'
  status: string,        // 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed'
  createdAt: timestamp,
  updatedAt: timestamp,
  assignedTo: string,
  adminNotes: string
}
```

### **Animal Reports Collection**
```javascript
{
  userId: string,
  animalType: string,     // 'dog' | 'cat' | 'bird' | etc.
  location: string,
  description: string,
  urgency: string,        // 'low' | 'medium' | 'high'
  status: string,         // 'pending' | 'in-progress' | 'resolved' | 'escalated'
  contactName: string,
  contactPhone: string,
  reportDate: timestamp,
  assignedTo: string,
  resolvedAt: timestamp
}
```

## 🚀 Deployment

### **Environment Variables**
Required environment variables in `.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `JWT_SECRET`
- `PORT`

### **Production Deployment**
```bash
# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Start server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Development

### **Adding New Routes**
1. Create route file in `routes/` directory
2. Export Express router
3. Import and use in `server.js`
4. Add authentication middleware if needed

### **Database Operations**
Use Firebase Admin SDK:
```javascript
// Add document
await req.db.collection('collection').add(data);

// Update document
await req.db.collection('collection').doc(id).update(data);

// Get document
const doc = await req.db.collection('collection').doc(id).get();

// Query documents
const snapshot = await req.db.collection('collection')
  .where('field', '==', value)
  .get();
```

## 🔧 Monitoring

### **Health Check**
```bash
GET /api/health
```

### **System Stats**
```bash
GET /api/admin/system
```

## 📞 Support

For support and questions:
- Email: support@carebridge.org
- Documentation: Check API endpoints above
- Issues: Create GitHub issue

## 📄 License

MIT License - see LICENSE file for details.
