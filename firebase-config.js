/**
 * Firebase Configuration with Environment Support
 * Updated to use proper environment variables and security
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, off, serverTimestamp, connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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
          apiKey: "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk",
          authDomain: "commentator78694.firebaseapp.com", 
          databaseURL: "https://commentator78694-default-rtdb.firebaseio.com",
          projectId: "commentator78694",
          storageBucket: "commentator78694.firebasestorage.app",
          messagingSenderId: "318788278941",
          appId: "1:318788278941:web:c47dca1e572e3f767f9274"
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
  onAuthStateChanged
};
