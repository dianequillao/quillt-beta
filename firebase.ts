import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR FIREBASE CONFIG HERE
// You can get this from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyD_XK0vpTTTonqGQvTlLRAIouY4StUoE24",
  authDomain: "quillt-beta.firebaseapp.com",
  projectId: "quillt-beta",
  storageBucket: "quillt-beta.firebasestorage.app",
  messagingSenderId: "171965310892",
  appId: "1:171965310892:web:b8b5b1d71a94342cb97c09",
  measurementId: "G-MRN9B9V59F"
};

// Check if config is set up to prevent crashing
const isConfigured = Object.keys(firebaseConfig).length > 0;

const app = isConfigured ? initializeApp(firebaseConfig) : undefined;
export const auth = isConfigured ? getAuth(app) : undefined;
export const db = isConfigured ? getFirestore(app) : undefined;
export const googleProvider = new GoogleAuthProvider();

export const isFirebaseReady = isConfigured;