import React, { useEffect } from 'react';
import { auth } from './firebase';

const RouteGuard = ({ children }) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // If no user, redirect to login page
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  return children;
};

export default RouteGuard;
