/**
 * Firebase Data Operations Module for Commentator
 *
 * This module handles all Firebase Realtime Database operations for:
 * - Comments management
 * - User data management
 * - Session data management
 * - Utility functions
 */

// Import Firebase configuration and services
import {
  database,
  ref,
  set,
  get,
  push,
  onValue,
  serverTimestamp,
} from '../firebase-config.js';

// Import authentication functions
import { getCurrentUser } from './firebase-auth.js';

/**
 * Generate a URL hash for Firebase storage
 * @param {string} url - The URL to hash
 * @returns {string} - Hashed URL safe for Firebase
 */
function generateUrlHash(url) {
  // Create a hash from the URL for Firebase storage
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Simple hash function to convert URL to Firebase-safe key
  let hash = 0;
  for (let i = 0; i < cleanUrl.length; i++) {
    const char = cleanUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Save a comment to Firebase
 * @param {string} url - The URL where the comment was made
 * @param {Object} commentData - Comment data object
 * @returns {Promise<Object>} - Result object with success status
 */
async function saveComment(url, commentData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate required comment data
    if (!commentData.content || !commentData.author) {
      throw new Error('Missing required comment data (content, author)');
    }

    // Generate URL hash for Firebase storage
    const urlHash = generateUrlHash(url);
    
    // Reference to comments for this URL
    const commentsRef = ref(database, `comments/${urlHash}`);
    
    // Prepare comment object
    const comment = {
      content: commentData.content,
      author: commentData.author,
      timestamp: serverTimestamp(),
      userId: user.uid,
      url: url,
      status: 'published',
    };

    // Add optional fields if provided
    if (commentData.email) comment.email = commentData.email;
    if (commentData.website) comment.website = commentData.website;
    if (commentData.parentId) comment.parentId = commentData.parentId;

    // Save comment to Firebase
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, comment);

    console.log('✅ Comment saved successfully:', newCommentRef.key);
    
    return {
      success: true,
      commentId: newCommentRef.key,
      message: 'Comment saved successfully',
      comment: { ...comment, id: newCommentRef.key }
    };
    
  } catch (error) {
    console.error('❌ Failed to save comment:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to save comment'
    };
  }
}

/**
 * Load comments for a specific URL
 * @param {string} url - The URL to load comments for
 * @returns {Promise<Object>} - Result object with comments data
 */
async function loadComments(url) {
  try {
    const urlHash = generateUrlHash(url);
    const commentsRef = ref(database, `comments/${urlHash}`);
    
    const snapshot = await get(commentsRef);
    if (snapshot.exists()) {
      const commentsData = snapshot.val();
      
      // Convert Firebase object to array with IDs
      const comments = Object.keys(commentsData).map((key) => ({
        id: key,
        ...commentsData[key],
      }));

      // Sort comments by timestamp (newest first)
      comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log(`✅ Loaded ${comments.length} comments for URL hash: ${urlHash}`);
      
      return {
        success: true,
        comments: comments,
        count: comments.length,
        message: `Loaded ${comments.length} comments`
      };
    } else {
      console.log(`ℹ️ No comments found for URL hash: ${urlHash}`);
      return {
        success: true,
        comments: [],
        count: 0,
        message: 'No comments found'
      };
    }
  } catch (error) {
    console.error('❌ Failed to load comments:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to load comments'
    };
  }
}

/**
 * Subscribe to real-time comment updates for a URL
 * @param {string} url - The URL to subscribe to
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
      
      // Sort comments by timestamp
      comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      callback({
        success: true,
        comments: comments,
        count: comments.length
      });
    } else {
      callback({
        success: true,
        comments: [],
        count: 0
      });
    }
  }, (error) => {
    console.error('❌ Comments subscription error:', error);
    callback({
      success: false,
      error: error.message,
      comments: [],
      count: 0
    });
  });
  
  return unsubscribe;
}

/**
 * Save user data to Firebase
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} - Result object with success status
 */
async function saveUserData(userData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRef = ref(database, `users/${user.uid}`);
    const userDataWithTimestamp = {
      ...userData,
      lastUpdated: serverTimestamp(),
      userId: user.uid,
    };

    await set(userRef, userDataWithTimestamp);
    
    console.log('✅ User data saved successfully');
    return {
      success: true,
      message: 'User data saved successfully',
      userData: userDataWithTimestamp
    };
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to save user data'
    };
  }
}

/**
 * Load user data from Firebase
 * @param {string} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} - Result object with user data
 */
async function loadUserData(userId = null) {
  try {
    const user = getCurrentUser();
    const targetUserId = userId || user?.uid;
    
    if (!targetUserId) {
      throw new Error('No user ID provided and no authenticated user');
    }

    const userRef = ref(database, `users/${targetUserId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('✅ User data loaded successfully');
      return {
        success: true,
        userData: userData,
        message: 'User data loaded successfully'
      };
    } else {
      console.log('ℹ️ No user data found');
      return {
        success: true,
        userData: null,
        message: 'No user data found'
      };
    }
  } catch (error) {
    console.error('❌ Failed to load user data:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to load user data'
    };
  }
}

/**
 * Create a new session
 * @param {Object} sessionData - Session data object (optional)
 * @returns {Promise<Object>} - Result object with session info
 */
async function createSession(sessionData = {}) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const sessionRef = ref(database, `sessions/${user.uid}`);
    const session = {
      userId: user.uid,
      startTime: serverTimestamp(),
      lastActivity: serverTimestamp(),
      status: 'active',
      ...sessionData,
    };

    await set(sessionRef, session);
    
    console.log('✅ Session created successfully');
    return {
      success: true,
      sessionId: user.uid,
      session: session,
      message: 'Session created successfully'
    };
  } catch (error) {
    console.error('❌ Failed to create session:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create session'
    };
  }
}

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Result object
 */
async function updateSessionActivity(sessionId) {
  try {
    const sessionRef = ref(database, `sessions/${sessionId}/lastActivity`);
    await set(sessionRef, serverTimestamp());
    
    return {
      success: true,
      message: 'Session activity updated'
    };
  } catch (error) {
    console.error('❌ Failed to update session activity:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update session activity'
    };
  }
}

/**
 * Close a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Result object
 */
async function closeSession(sessionId) {
  try {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const updateData = {
      status: 'closed',
      endTime: serverTimestamp(),
      lastActivity: serverTimestamp(),
    };

    // Update session with close data
    const snapshot = await get(sessionRef);
    if (snapshot.exists()) {
      const currentSession = snapshot.val();
      await set(sessionRef, { ...currentSession, ...updateData });
    }
    
    console.log('✅ Session closed successfully');
    return {
      success: true,
      message: 'Session closed successfully'
    };
  } catch (error) {
    console.error('❌ Failed to close session:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to close session'
    };
  }
}

// Export data operation functions
export {
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