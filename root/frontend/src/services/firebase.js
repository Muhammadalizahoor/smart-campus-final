import { initializeApp } from "firebase/app";   //frontend//src//services//firebase.js
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// 1️⃣ YOUR FRIEND'S CONFIG (Stops, Routes, Buses)
const friendConfig = {
  apiKey: "AIzaSyD-VLojBDBwCRwQRUxpSXl191MRpUz9NGY",
  authDomain: "locations-f7114.firebaseapp.com",
  projectId: "locations-f7114",
  storageBucket: "locations-f7114.firebasestorage.app",
  messagingSenderId: "250017893935",
  appId: "1:250017893935:web:8d59ff0efb2adf55ae40da",
};

// 2️⃣ YOUR CONFIG (Live Tracking - smart-campus-7e161)
const myConfig = {
  apiKey: "AIzaSyCN5j1uG14ca37yU3vK4AI0QJL8MswNMLk",
  authDomain: "smart-campus-7e161.firebaseapp.com",
  databaseURL: "https://smart-campus-7e161-default-rtdb.firebaseio.com",
  projectId: "smart-campus-7e161",
  storageBucket: "smart-campus-7e161.firebasestorage.app",
  messagingSenderId: "203474285052",
  appId: "1:203474285052:web:35cddaababa820db250279"
};

// Initialize both apps
const friendApp = initializeApp(friendConfig, "friendApp");
const myApp = initializeApp(myConfig, "myApp");

// 👉 EXPORT Firestore from FRIEND'S project
export const firestore = getFirestore(friendApp);

// 👉 EXPORT Realtime DB from YOUR project
export const rtdb = getDatabase(myApp);