import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import api from './api';

const RouteGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from backend
          const response = await api.get(`/api/users/${firebaseUser.uid}`);
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If backend fails, still allow Firebase user
          setUser(firebaseUser);
        }
      } else {
        // If no user, redirect to login page
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return children;
};

export default RouteGuard;
