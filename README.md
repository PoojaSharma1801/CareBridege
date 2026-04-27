# CareBridge

A comprehensive platform for connecting people with care services, animal welfare, and emergency support.

## 🌐 Live Demo

**Live Site:** https://poojasharma1801.github.io/CareBridege

*The site automatically updates whenever you push changes to the main branch!*

## 🔐 Security Setup - IMPORTANT

This project uses environment variables to secure sensitive configuration data like API keys.

### Quick Setup (for development)

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **The project will work immediately** - the Firebase configuration has fallback values for development.

### For Production Deployment

1. **Create your own Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore
   - Get your configuration values

2. **Update your `.env` file:**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Deploy with your environment variables**

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PoojaSharma1801/CareBridege.git
   cd CareBridege
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development servers:**
   ```bash
   # Backend (in one terminal)
   cd backend
   npm start
   
   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
CareBridge/
├── backend/
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore file (includes .env)
└── README.md           # This file
```

## 🔒 Security Features

- ✅ API keys are stored in environment variables
- ✅ `.env` files are excluded from git
- ✅ Fallback values for development (removed in production)
- ✅ Environment-based configuration

## 🛠️ Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** CSS

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Note:** Never commit your actual `.env` file with real API keys to version control. Always use environment variables in production.
