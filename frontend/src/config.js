// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
    firebaseConfig: {
      // Use environment variables or fallback for development
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAcLbekbhi7rgJIxw0qYr_yg3cyOiDcbKI",
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "carebridge-7974d.firebaseapp.com",
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "carebridge-7974d",
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "carebridge-7974d.firebasestorage.app",
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "493353782115",
      appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:493353782115:web:10927eb63c777a5e2be156",
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-G7B37TFF08"
    }
  },
  production: {
    apiUrl: 'https://carebridge-backend.onrender.com', // This will be your live backend URL
    firebaseConfig: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    }
  }
};

// Get current environment
const getCurrentConfig = () => {
  return config[process.env.NODE_ENV] || config.development;
};

export default getCurrentConfig();
