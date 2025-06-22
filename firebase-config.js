// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, off, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk",
  authDomain: "commentator78694.firebaseapp.com",
  databaseURL: "https://commentator78694-default-rtdb.firebaseio.com", // Add the database URL
  projectId: "commentator78694",
  storageBucket: "commentator78694.firebasestorage.app",
  messagingSenderId: "318788278941",
  appId: "1:318788278941:web:c47dca1e572e3f767f9274"
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
