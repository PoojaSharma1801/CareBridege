// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import config from './config';

// Use configuration based on environment
const firebaseConfig = config.firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Firebase Auth functions
export const firebaseAuth = {
  signIn: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signUp: async (email, password, fullName, phone) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: email,
        fullName: fullName,
        phone: phone || null,
        role: email.includes('admin') || email === 'admin@carebridge.org' ? 'admin' : 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profile: {
          avatar: null,
          bio: null,
          location: null
        },
        stats: {
          servicesUsed: 0,
          donations: 0,
          volunteerHours: 0,
          impactScore: 0
        }
      });

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged(callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// Firestore functions
export const firestore = {
  // User operations
  getUserProfile: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateUserProfile: async (uid, data) => {
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Service requests
  createServiceRequest: async (requestData) => {
    try {
      const docRef = await addDoc(collection(db, "serviceRequests"), {
        ...requestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserServiceRequests: async (uid) => {
    try {
      const q = query(
        collection(db, "serviceRequests"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Activities
  createActivity: async (activityData) => {
    try {
      const docRef = await addDoc(collection(db, "activities"), {
        ...activityData,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserActivities: async (uid, limitCount = 20) => {
    try {
      const q = query(
        collection(db, "activities"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const activities = [];
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: activities };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Notifications
  getUserNotifications: async (uid, unreadOnly = false) => {
    try {
      let q = query(
        collection(db, "notifications"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      if (unreadOnly) {
        q = query(q, where("read", "==", false));
      }

      const querySnapshot = await getDocs(q);
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const docRef = doc(db, "notifications", notificationId);
      await updateDoc(docRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Animal reports
  createAnimalReport: async (reportData) => {
    try {
      const docRef = await addDoc(collection(db, "animalReports"), {
        ...reportData,
        reportDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Emergency reports
  createEmergencyReport: async (emergencyData) => {
    try {
      const docRef = await addDoc(collection(db, "emergencies"), {
        ...emergencyData,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin functions
  getAllUsers: async (page = 1, limitCount = 20) => {
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllServiceRequests: async (status = null) => {
    try {
      let q = query(
        collection(db, "serviceRequests"),
        orderBy("createdAt", "desc")
      );

      if (status) {
        q = query(q, where("status", "==", status));
      }

      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateServiceRequest: async (requestId, updateData) => {
    try {
      const docRef = doc(db, "serviceRequests", requestId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateUserStatus: async (uid, status, reason = null) => {
    try {
      const docRef = doc(db, "users", uid);
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (reason) {
        updateData.statusReason = reason;
      }

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export Firebase instances
export { auth, db };
export default app;
