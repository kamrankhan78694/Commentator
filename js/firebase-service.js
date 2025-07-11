/**
 * Firebase Service Module for Commentator
 *
 * This module handles all Firebase Realtime Database operations for:
 * - Comments management
 * - User data management
 * - Session data management
 */

// Import Firebase configuration and services
import {
  database,
  auth,
  ref,
  set,
  get,
  push,
  onValue,
  serverTimestamp,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut,
} from '../firebase-config.js';

// Firebase service object to avoid module complications
window.FirebaseService = (function () {
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
          console.log('🔐 No user found, signing in anonymously...');
          // Sign in anonymously for commenting
          signInAnonymously(auth)
            .then((result) => {
              currentUser = result.user;
              isAuthenticated = true;
              console.log('✅ Anonymous user created:', result.user.uid);
              console.log('🔐 Authentication state: AUTHENTICATED (anonymous)');
              unsubscribe(); // Clean up listener
              resolve(result.user);
            })
            .catch((error) => {
              console.error('❌ Authentication failed:', error);
              console.log('🔐 Authentication state: FAILED');
              isAuthenticated = false;
              currentUser = null;
              unsubscribe(); // Clean up listener
              resolve(null);
            });
        }
      });

      // Timeout fallback after 10 seconds
      setTimeout(() => {
        if (!isAuthenticated) {
          console.error('❌ Authentication timeout after 10 seconds');
          unsubscribe();
          resolve(null);
        }
      }, 10000);
    });
  }

  /**
   * Generate a URL hash for organizing comments
   * @param {string} url - The URL to generate hash for
   * @returns {string} - Base64 encoded URL hash
   */
  function generateUrlHash(url) {
    // Remove protocol and trailing slashes for consistency
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    // Use btoa for base64 encoding, replace special chars for Firebase keys
    return btoa(cleanUrl).replace(/[.#$[\]]/g, '_');
  }

  /**
   * Save a comment to Firebase
   * @param {string} url - The URL the comment is for
   * @param {Object} commentData - The comment data object
   * @returns {Promise<string>} - The comment ID
   */
  async function saveComment(url, commentData) {
    console.log('🔥 SaveComment called with:', {
      url,
      commentData,
      isAuthenticated,
    });

    if (!isAuthenticated || !currentUser) {
      console.error('❌ User must be authenticated to save comments');
      console.log('🔐 Current auth state:', {
        isAuthenticated,
        currentUser: !!currentUser,
      });
      throw new Error(
        'User must be authenticated to save comments. Please wait for authentication to complete.'
      );
    }

    try {
      const urlHash = generateUrlHash(url);
      console.log('🔑 Generated URL hash:', urlHash);

      const commentsRef = ref(database, `comments/${urlHash}`);
      console.log('📍 Firebase ref path:', `comments/${urlHash}`);

      // Add server timestamp and user ID
      const comment = {
        ...commentData,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        createdAt: Date.now(),
      };

      console.log('💾 Saving comment data:', comment);

      const newCommentRef = push(commentsRef);
      await set(newCommentRef, comment);

      console.log(
        '✅ Comment saved to Firebase successfully! ID:',
        newCommentRef.key
      );
      return newCommentRef.key;
    } catch (error) {
      console.error('❌ Error saving comment to Firebase:', error);
      console.error('📊 Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to save comment: ${error.message}`);
    }
  }

  /**
   * Load comments for a specific URL
   * @param {string} url - The URL to load comments for
   * @returns {Promise<Array>} - Array of comment objects
   */
  async function loadComments(url) {
    const urlHash = generateUrlHash(url);
    const commentsRef = ref(database, `comments/${urlHash}`);

    try {
      const snapshot = await get(commentsRef);
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        // Convert to array and add IDs
        const comments = Object.keys(commentsData).map((key) => ({
          id: key,
          ...commentsData[key],
        }));

        // Sort by creation time (newest first)
        comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        console.log(`Loaded ${comments.length} comments for URL:`, url);
        return comments;
      } else {
        console.log('No comments found for URL:', url);
        return [];
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      throw error;
    }
  }

  /**
   * Listen for real-time comment updates
   * @param {string} url - The URL to listen for comments
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} - Unsubscribe function
   */
  function subscribeToComments(url, callback) {
    const urlHash = generateUrlHash(url);
    const commentsRef = ref(database, `comments/${urlHash}`);

    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const comments = Object.keys(commentsData).map((key) => ({
          id: key,
          ...commentsData[key],
        }));

        // Sort by creation time (newest first)
        comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        callback(comments);
      } else {
        callback([]);
      }
    });

    // Return unsubscribe function
    return unsubscribe;
  }

  /**
   * Save user data to Firebase
   * @param {Object} userData - User data object
   * @returns {Promise<void>}
   */
  async function saveUserData(userData) {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to save user data');
    }

    const userRef = ref(database, `users/${currentUser.uid}`);
    const user = {
      ...userData,
      lastActive: serverTimestamp(),
      updatedAt: Date.now(),
    };

    await set(userRef, user);
    console.log('User data saved to Firebase');
  }

  /**
   * Load user data from Firebase
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object|null>} - User data object or null
   */
  async function loadUserData(userId = null) {
    const targetUserId = userId || (currentUser ? currentUser.uid : null);

    if (!targetUserId) {
      return null;
    }

    const userRef = ref(database, `users/${targetUserId}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        console.log('User data loaded from Firebase');
        return snapshot.val();
      } else {
        console.log('No user data found');
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  /**
   * Create a new session
   * @param {Object} sessionData - Additional session data
   * @returns {Promise<string>} - Session ID
   */
  async function createSession(sessionData = {}) {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to create session');
    }

    const sessionId = `session_${currentUser.uid}_${Date.now()}`;
    const sessionRef = ref(database, `sessions/${sessionId}`);

    const session = {
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      userAgent: navigator.userAgent,
      ...sessionData,
    };

    await set(sessionRef, session);
    console.log('Session created:', sessionId);
    return sessionId;
  }

  /**
   * Update session activity
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async function updateSessionActivity(sessionId) {
    if (!isAuthenticated) {
      return;
    }

    const sessionRef = ref(database, `sessions/${sessionId}/lastActivity`);
    await set(sessionRef, serverTimestamp());
  }

  /**
   * Close a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async function closeSession(sessionId) {
    if (!isAuthenticated) {
      return;
    }

    const sessionRef = ref(database, `sessions/${sessionId}`);
    const closedAt = serverTimestamp();

    // Update session with closed timestamp
    const updates = {
      closedAt,
      lastActivity: closedAt,
    };

    await set(sessionRef, updates);
    console.log('Session closed:', sessionId);
  }

  /**
   * Get current user information
   * @returns {Object|null} - Current user object
   */
  function getCurrentUser() {
    return currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  function isUserAuthenticated() {
    const result = isAuthenticated && currentUser !== null;
    console.log('🔐 isUserAuthenticated check:', {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      result,
    });
    return result;
  }

  /**
   * Get authentication status details for debugging
   * @returns {Object} - Detailed authentication status
   */
  function getAuthStatus() {
    return {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      userId: currentUser ? currentUser.uid : null,
      isAnonymous: currentUser ? currentUser.isAnonymous : null,
      timestamp: Date.now(),
    };
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User object
   */
  async function signInWithEmail(email, password) {
    try {
      console.log('🔐 Signing in with email...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      currentUser = userCredential.user;
      isAuthenticated = true;
      console.log('✅ Email sign-in successful:', currentUser.uid);
      return currentUser;
    } catch (error) {
      console.error('❌ Email sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Create account with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} - User object
   */
  async function createAccount(email, password, displayName) {
    try {
      console.log('📝 Creating account with email...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      currentUser = userCredential.user;
      isAuthenticated = true;
      console.log('✅ Account created successfully:', currentUser.uid);
      return currentUser;
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} - User object
   */
  async function signInWithGoogle() {
    try {
      console.log('🔐 Signing in with Google...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      currentUser = result.user;
      isAuthenticated = true;
      console.log('✅ Google sign-in successful:', currentUser.uid);
      return currentUser;
    } catch (error) {
      console.error('❌ Google sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async function signOutUser() {
    try {
      console.log('🔐 Signing out user...');
      await signOut(auth);
      currentUser = null;
      isAuthenticated = false;
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile information
   * @returns {Object|null} - User profile data
   */
  function getUserProfile() {
    if (!currentUser) return null;

    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      isAnonymous: currentUser.isAnonymous,
      emailVerified: currentUser.emailVerified,
      createdAt: currentUser.metadata.creationTime,
      lastSignIn: currentUser.metadata.lastSignInTime,
    };
  }

  // Public API
  return {
    // Authentication
    initAuth,
    getCurrentUser,
    isUserAuthenticated,
    getAuthStatus,
    getUserProfile,
    signInWithEmail,
    createAccount,
    signInWithGoogle,
    signOutUser,

    // Comments
    saveComment,
    loadComments,
    subscribeToComments,

    // Users
    saveUserData,
    loadUserData,

    // Sessions
    createSession,
    updateSessionActivity,
    closeSession,

    // Utilities
    generateUrlHash,
  };
})();
