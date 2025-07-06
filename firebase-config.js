/**
 * Firebase Configuration with Environment Support
 * Updated to use proper environment variables and security
 */

// Environment variable helper for Firebase configuration
function getEnvVar(key, defaultValue = null) {
  // Check for browser environment variables (usually set via build process)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Check for window-level configuration
  if (typeof window !== 'undefined' && window.env && window.env[key]) {
    return window.env[key];
  }
  
  // Return default value
  return defaultValue;
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, off, serverTimestamp, connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Wait for environment configuration to be loaded
function waitForEnvironmentConfig() {
  return new Promise((resolve) => {
    if (window.EnvironmentConfig) {
      resolve(window.EnvironmentConfig);
    } else {
      const checkConfig = () => {
        if (window.EnvironmentConfig) {
          resolve(window.EnvironmentConfig);
        } else {
          setTimeout(checkConfig, 100);
        }
      };
      checkConfig();
    }
  });
}

// Initialize Firebase with environment configuration
async function initializeFirebaseApp() {
  try {
    // Wait for environment configuration
    const envConfig = await waitForEnvironmentConfig();
    
    // Get Firebase configuration from environment
    const firebaseConfig = envConfig.getFirebaseConfig();
    
    // Validate configuration
    envConfig.validateConfiguration();
    
    // Log initialization
    console.log(`🔥 Initializing Firebase for ${envConfig.getEnvironment()} environment`);
    
    return firebaseConfig;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // Use default development configuration from environment config
    console.warn('⚠️  Using fallback development configuration');
    
    // Create a minimal fallback environment config
    const fallbackConfig = new (class {
      getFirebaseConfig() {
        return {
          apiKey: getEnvVar('FIREBASE_API_KEY', "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk"),
          authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "commentator78694.firebaseapp.com"), 
          databaseURL: getEnvVar('FIREBASE_DATABASE_URL', "https://commentator78694-default-rtdb.firebaseio.com"),
          projectId: getEnvVar('FIREBASE_PROJECT_ID', "commentator78694"),
          storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "commentator78694.firebasestorage.app"),
          messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', "318788278941"),
          appId: getEnvVar('FIREBASE_APP_ID', "1:318788278941:web:c47dca1e572e3f767f9274")
        };
      }
      getEnvironment() { return 'development'; }
      areEmulatorsEnabled() { return false; }
    })();
    
    return fallbackConfig.getFirebaseConfig();
  }
}

// Get Firebase configuration (this will be resolved when environment is ready)
const firebaseConfig = await initializeFirebaseApp();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const database = getDatabase(app);
const auth = getAuth(app);

// Connect to emulators in development
async function setupEmulators() {
  try {
    const envConfig = window.EnvironmentConfig;
    if (envConfig && envConfig.areEmulatorsEnabled() && envConfig.getEnvironment() === 'development') {
      // Only connect to emulators if not already connected and in development
      if (!database._delegate._repoInternal) {
        connectDatabaseEmulator(database, 'localhost', 9000);
        console.log('🔧 Connected to Firebase Database emulator');
      }
      if (!auth._delegate.emulatorConfig) {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('🔧 Connected to Firebase Auth emulator');
      }
    }
  } catch (error) {
    console.log('📡 Using remote Firebase (emulators not available)');
  }
}

// Setup emulators after initialization
setupEmulators();

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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut
};
