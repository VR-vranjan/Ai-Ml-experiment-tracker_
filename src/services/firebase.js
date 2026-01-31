// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR6G_MxR9QP7eZuqlmOLmhT9k5OOsZwRw",
  authDomain: "bibliophiles-3e10c.firebaseapp.com",
  projectId: "bibliophiles-3e10c",
  storageBucket: "bibliophiles-3e10c.appspot.com",
  messagingSenderId: "402201531977",
  appId: "1:402201531977:web:40c120a04249a3084e1198",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
