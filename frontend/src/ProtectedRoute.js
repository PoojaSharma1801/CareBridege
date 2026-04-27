import React from 'react';

const ProtectedRoute = ({ children, requiredRole, currentUser, isAdmin }) => {
  // If no user is logged in, redirect to login
  if (!currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🔐 Access Denied</h2>
          <p>Please log in to access this page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If specific role is required and user doesn't have it
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🛑 Admin Access Required</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <p>Please contact an administrator if you believe this is an error.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // User has required permissions, render the component
  return children;
};

export default ProtectedRoute;
