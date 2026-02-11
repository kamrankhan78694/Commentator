/**
 * Firebase Service Module for Commentator
 *
 * Compatibility layer that imports the modularized Firebase components.
 * This maintains backward compatibility while enforcing the 500-line limit.
 */

// Import modularized Firebase components
import {
  initAuth,
  getCurrentUser,
  isUserAuthenticated,
  getAuthStatus,
  signInWithEmail,
  createAccount,
  signInWithGoogle,
  signOutUser,
  getUserProfile,
} from './firebase-auth.js';

import {
  saveComment,
  loadComments,
  subscribeToComments,
  editComment,
  deleteComment,
  flagComment,
  saveUserData,
  loadUserData,
  createSession,
  updateSessionActivity,
  closeSession,
  generateUrlHash,
} from './firebase-data.js';

// Firebase service object to maintain compatibility
window.FirebaseService = (function () {
  return {
    // Authentication
    initAuth,
    getCurrentUser,
    isUserAuthenticated,
    getAuthStatus,
    signInWithEmail,
    createAccount,
    signInWithGoogle,
    signOutUser,
    getUserProfile,

    // Comments
    saveComment,
    loadComments,
    subscribeToComments,
    editComment,
    deleteComment,
    flagComment,

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

// Export for module usage
export default window.FirebaseService;