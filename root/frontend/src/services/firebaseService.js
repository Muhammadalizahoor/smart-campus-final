
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "c",
  authDomain: "",
  databaseURL: "hp",
  projectId: "",
  storageBucket: "s",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const routesRef = collection(db, 'routes');
const driversRef = collection(db, 'drivers');
const busesRef = collection(db, 'buses');
const stopsRef = collection(db, 'stops');
const studentsRef = collection(db, 'students');
const notificationsRef = collection(db, 'notifications');

// Helpers for notifications (frontend)
const subscribeNotifications = (onChange, limit = 50) => {
  // returns unsubscribe function
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(items);
  });
};

const markNotificationRead = async (notificationId, studentEmail) => {
  try {
    const d = doc(db, 'notifications', notificationId);
    // use arrayUnion to append email into readBy
    await updateDoc(d, { readBy: arrayUnion(studentEmail) });
    return true;
  } catch (err) {
    console.error('markNotificationRead error', err);
    return false;
  }
};

export {
  db,
  routesRef,
  driversRef,
  busesRef,
  stopsRef,
  studentsRef,
  notificationsRef,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  subscribeNotifications,
  markNotificationRead
};
