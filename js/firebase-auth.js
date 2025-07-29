/**
 * Firebase Authentication Module for Commentator
 *
 * This module handles all Firebase authentication operations:
 * - User authentication state management
 * - Email/password authentication
 * - Google OAuth authentication
 * - Anonymous authentication
 * - User profile management
 */

// Import Firebase configuration and services
import {
  auth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut,
} from '../firebase-config.js';

// Authentication state
let currentUser = null;
let isAuthenticated = false;

/**
 * Initialize Firebase authentication
 */
async function initAuth() {
  return new Promise((resolve) => {
    // Set up authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isAuthenticated = true;
        console.log('✅ User authenticated:', user.uid);
        console.log('🔐 Authentication state: AUTHENTICATED');
        unsubscribe(); // Clean up listener
        resolve(user);
      } else {
        console.log('🔐 No authenticated user, signing in anonymously...');
        
        // Sign in anonymously if no user is present
        signInAnonymously(auth)
          .then((result) => {
            currentUser = result.user;
            isAuthenticated = true;
            console.log('✅ Anonymous user created:', result.user.uid);
            console.log('🔐 Authentication state: ANONYMOUS');
            unsubscribe(); // Clean up listener
            resolve(result.user);
          })
          .catch((error) => {
            console.error('❌ Anonymous authentication failed:', error);
            unsubscribe(); // Clean up listener
            resolve(null);
          });
      }
    });
  });
}

/**
 * Get the current authenticated user
 * @returns {Object|null} - Current user object or null
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
function isUserAuthenticated() {
  return isAuthenticated && currentUser !== null;
}

/**
 * Get detailed authentication status
 * @returns {Object} - Authentication status object
 */
function getAuthStatus() {
  return {
    isAuthenticated: isAuthenticated,
    user: currentUser,
    isAnonymous: currentUser?.isAnonymous || false,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    displayName: currentUser?.displayName || null,
    photoURL: currentUser?.photoURL || null,
  };
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authentication result
 */
async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    currentUser = result.user;
    isAuthenticated = true;
    
    console.log('✅ Email sign-in successful:', result.user.uid);
    return {
      success: true,
      user: result.user,
      message: 'Successfully signed in with email and password'
    };
  } catch (error) {
    console.error('❌ Email sign-in failed:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}

/**
 * Create new account with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name (optional)
 * @returns {Promise<Object>} - Account creation result
 */
async function createAccount(email, password, displayName) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = result.user;
    isAuthenticated = true;
    
    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
      console.log('✅ User profile updated with display name:', displayName);
    }
    
    console.log('✅ Account created successfully:', result.user.uid);
    return {
      success: true,
      user: result.user,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('❌ Account creation failed:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} - Authentication result
 */
async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    isAuthenticated = true;
    
    console.log('✅ Google sign-in successful:', result.user.uid);
    return {
      success: true,
      user: result.user,
      message: 'Successfully signed in with Google'
    };
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}

/**
 * Sign out current user
 * @returns {Promise<Object>} - Sign out result
 */
async function signOutUser() {
  try {
    await signOut(auth);
    const previousUser = currentUser;
    currentUser = null;
    isAuthenticated = false;
    
    console.log('✅ User signed out successfully');
    
    // Re-initialize anonymous authentication
    await initAuth();
    
    return {
      success: true,
      previousUser: previousUser,
      message: 'Successfully signed out'
    };
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}

/**
 * Get user profile information
 * @returns {Object|null} - User profile or null
 */
function getUserProfile() {
  if (!currentUser) return null;
  
  return {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    emailVerified: currentUser.emailVerified,
    isAnonymous: currentUser.isAnonymous,
    creationTime: currentUser.metadata?.creationTime,
    lastSignInTime: currentUser.metadata?.lastSignInTime,
  };
}

// Export authentication functions
export {
  initAuth,
  getCurrentUser,
  isUserAuthenticated,
  getAuthStatus,
  signInWithEmail,
  createAccount,
  signInWithGoogle,
  signOutUser,
  getUserProfile,
};