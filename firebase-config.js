// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, off, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

/**
 * Get environment variable or fallback to default
 * In production, these should be injected at build time
 */
function getEnvVar(name, fallback) {
  // Check if running in Node.js environment with process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || fallback;
  }
  
  // Check if environment variables are injected into window object
  if (typeof window !== 'undefined' && window.ENV) {
    return window.ENV[name] || fallback;
  }
  
  // Fallback to hardcoded values for development
  return fallback;
}

// Your web app's Firebase configuration
// In production, these values should be injected via environment variables
const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk"),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "commentator78694.firebaseapp.com"),
  databaseURL: getEnvVar('FIREBASE_DATABASE_URL', "https://commentator78694-default-rtdb.firebaseio.com"),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', "commentator78694"),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "commentator78694.firebasestorage.app"),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', "318788278941"),
  appId: getEnvVar('FIREBASE_APP_ID', "1:318788278941:web:c47dca1e572e3f767f9274")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const database = getDatabase(app);
const auth = getAuth(app);

// Export Firebase services for use in other modules
export { 
  app, 
  database, 
  auth, 
  ref, 
  set, 
  get, 
  push, 
  onValue, 
  off, 
  serverTimestamp,
  signInAnonymously,
  onAuthStateChanged
};
