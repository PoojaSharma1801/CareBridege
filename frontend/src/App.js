import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import { firebaseAuth, firestore, auth } from './firebase';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user is admin
        const userEmail = user.email;
        const userIsAdmin = userEmail.includes('admin') || userEmail === 'admin@carebridge.org';
        setIsAdmin(userIsAdmin);
        setShowDashboard(true);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setShowDashboard(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isLogin) {
      // Login with Firebase
      const result = await firebaseAuth.signIn(formData.email, formData.password);
      
      if (result.success) {
        const userIsAdmin = formData.email.includes('admin') || formData.email === 'admin@carebridge.org';
        setIsAdmin(userIsAdmin);
        
        setMessage({ 
          type: 'success', 
          text: `Login successful! Redirecting to ${userIsAdmin ? 'admin' : 'user'} dashboard...` 
        });
        
        // Update last login
        await firestore.updateUserProfile(result.user.uid, {
          lastLogin: new Date()
        });
        
        setTimeout(() => {
          setShowDashboard(true);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } else {
      // Signup with Firebase
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        setLoading(false);
        return;
      }

      const result = await firebaseAuth.signUp(formData.email, formData.password, formData.fullName, formData.phone);
      
      if (result.success) {
        const userIsAdmin = formData.email.includes('admin') || formData.email === 'admin@carebridge.org';
        setIsAdmin(userIsAdmin);
        
        setMessage({ 
          type: 'success', 
          text: `Account created successfully! ${userIsAdmin ? 'Admin account created.' : 'Welcome to CareBridge!'}` 
        });
        
        setTimeout(() => {
          setIsLogin(true);
          resetForm();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
      phone: ''
    });
    setMessage({ type: '', text: '' });
  };

  const switchTab = (login) => {
    setIsLogin(login);
    resetForm();
  };

  const handleLogout = async () => {
    const result = await firebaseAuth.signOut();
    if (result.success) {
      setShowDashboard(false);
      setIsAdmin(false);
      resetForm();
      setIsLogin(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    const result = await firebaseAuth.resetPassword(formData.email);
    if (result.success) {
      setMessage({ type: 'success', text: 'Password reset instructions sent to your email' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  if (showDashboard && currentUser) {
    if (isAdmin) {
      return (
        <ProtectedRoute 
          currentUser={currentUser} 
          isAdmin={isAdmin} 
          requiredRole="admin"
        >
          <AdminDashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      );
    } else {
      return (
        <ProtectedRoute 
          currentUser={currentUser} 
          isAdmin={isAdmin}
        >
          <Dashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      );
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏥 CareBridge</h1>
          <p>Connecting Healthcare with Technology</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-body">
          {message.text && (
            <div className={`alert alert--${message.type === 'error' ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <button type="submit" className="btn-auth btn-auth--primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {isLogin ? ' Signing In...' : ' Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button className="btn-auth btn-auth--google">
            📧 Continue with Google
          </button>

          <div className="auth-links">
            <button 
              type="button" 
              className="link-btn"
              onClick={handlePasswordReset}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        
          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => switchTab(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
