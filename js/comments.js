/**
 * Comments Module
 *
 * Handles comment interface functionality, comment loading, and submission
 * for the Commentator application.
 *
 * @module Comments
 */

import {
  displayComments,
  formatTimestamp,
  createLoadingState,
  createErrorState,
  scrollToNewComment,
} from './comment-display.js';

// Helper function to escape HTML special characters
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Initialize the comment interface functionality
 */
export function initCommentInterface() {
  const urlInput = document.getElementById('website-url');
  const loadCommentsBtn = document.getElementById('load-comments-btn');
  const commentsSection = document.getElementById('comments-section');
  const commentText = document.getElementById('comment-text');
  const submitCommentBtn = document.getElementById('submit-comment-btn');
  const getStartedBtn = document.getElementById('get-started-btn');
  const demoBtn = document.getElementById('demo-btn');

  // Handle "Get Started" button click
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      // Scroll to demo section
      const demoSection = document.getElementById('demo-section');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Handle "View Demo" button click
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          'User clicked "View Demo" button',
          'info',
          'USER_INTERACTION'
        );
      }
      // Scroll to demo section and focus on URL input
      const demoSection = document.getElementById('demo-section');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (urlInput) urlInput.focus();
        }, 500);
      }
    });
  }

  // Handle "Load Comments" button click
  if (loadCommentsBtn && urlInput && commentsSection) {
    loadCommentsBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();

      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          `User clicked "Load Comments" for URL: ${url || '(empty)'}`,
          'info',
          'USER_INTERACTION'
        );
      }

      if (!url) {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.warning(
            'User attempted to load comments with empty URL',
            'VALIDATION'
          );
        }
        // Import showNotification from forms module
        if (window.showNotification) {
          window.showNotification('Please enter a valid URL', 'error');
        }
        urlInput.focus();
        return;
      }

      // Import isValidUrl from navigation module
      if (window.isValidUrl && !window.isValidUrl(url)) {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.warning(
            `User entered invalid URL: ${url}`,
            'VALIDATION'
          );
        }
        if (window.showNotification) {
          window.showNotification(
            'Please enter a valid URL (e.g., https://example.com)',
            'error'
          );
        }
        urlInput.focus();
        return;
      }

      // Show loading state on button
      const originalText = loadCommentsBtn.textContent;
      loadCommentsBtn.textContent = 'Loading...';
      loadCommentsBtn.disabled = true;

      // Load comments with proper API integration
      loadCommentsForUrl(url, commentsSection).finally(() => {
        // Reset button state
        loadCommentsBtn.textContent = originalText;
        loadCommentsBtn.disabled = false;
      });
    });
  }

  // Handle "Submit Comment" button click
  if (submitCommentBtn && commentText) {
    submitCommentBtn.addEventListener('click', () => {
      const comment = commentText.value.trim();
      const url = urlInput ? urlInput.value.trim() : '';

      console.log('Submit button clicked:', {
        comment: comment.substring(0, 50),
        url,
      });

      if (!comment) {
        if (window.showNotification) {
          window.showNotification('Please enter a comment', 'error');
        }
        commentText.focus();
        return;
      }

      if (!url) {
        if (window.showNotification) {
          window.showNotification('Please enter a URL first', 'error');
        }
        if (urlInput) urlInput.focus();
        return;
      }

      // Submit the comment
      submitComment(url, comment, commentsSection, commentText);
    });
  }
}

/**
 * Load comments for a URL using Firebase
 * @param {string} url - The URL to load comments for
 * @param {HTMLElement} commentsSection - The element to display comments in
 */
export async function loadCommentsForUrl(url, commentsSection) {
  if (window.CommentatorLogger) {
    window.CommentatorLogger.action(
      `Loading comments for ${url}`,
      'info',
      'COMMENTS'
    );
  }

  // Show loading state
  commentsSection.innerHTML = createLoadingState(escapeHtml(url));

  try {
    // Check if Firebase service is available
    if (typeof window.FirebaseService === 'undefined') {
      console.log('🏠 Firebase not available, loading comments locally');
      if (window.loadCommentsLocal) {
        return window.loadCommentsLocal(url, commentsSection);
      }
      throw new Error(
        'Firebase service is not available and local fallback is not ready. Please refresh the page.'
      );
    }

    // Load comments from Firebase
    const comments = await window.FirebaseService.loadComments(url);

    if (window.CommentatorLogger) {
      window.CommentatorLogger.success(
        `Loaded ${comments.length} comments for ${url}`,
        'COMMENTS'
      );
    }

    // Format timestamps for display
    const formattedComments = comments.map((comment) => ({
      ...comment,
      author: comment.author || 'Anonymous',
      timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
      votes: comment.votes || 0,
    }));

    displayComments(formattedComments, commentsSection);

    // Show success message
    if (formattedComments.length > 0) {
      if (window.showNotification) {
        window.showNotification(
          `Successfully loaded ${formattedComments.length} comment${formattedComments.length > 1 ? 's' : ''}`,
          'success'
        );
      }
    } else {
      if (window.showNotification) {
        window.showNotification(
          'No comments found for this URL. Be the first to comment!',
          'info'
        );
      }
    }

    // Set up real-time listener for new comments
    // Unsubscribe any existing listener to avoid multiple active subscriptions
    if (window.currentCommentsUnsubscribe) {
      window.currentCommentsUnsubscribe();
    }
    window.currentCommentsUnsubscribe =
      window.FirebaseService.subscribeToComments(url, (updatedComments) => {
        const formattedUpdated = updatedComments.map((comment) => ({
          ...comment,
          author: comment.author || 'Anonymous',
          timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
          votes: comment.votes || 0,
        }));
        displayComments(formattedUpdated, commentsSection);
      });
  } catch (error) {
    console.error('Error loading comments:', error);
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Failed to load comments for ${url}: ${error.message}`,
        'COMMENTS',
        error
      );
    }
    commentsSection.innerHTML = createErrorState(error.message);

    // Show error notification
    if (window.showNotification) {
      window.showNotification(
        `Failed to load comments: ${error.message}`,
        'error'
      );
    }

    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.action(
            'Retrying comment load',
            'info',
            'COMMENTS'
          );
        }
        loadCommentsForUrl(url, commentsSection);
      });
    }
  }
}

/**
 * Submit a new comment using Firebase API
 * @param {string} url - The URL the comment is for
 * @param {string} comment - The comment text
 * @param {HTMLElement} commentsSection - The comments display element
 * @param {HTMLElement} commentTextarea - The comment input element
 */
export async function submitComment(
  url,
  comment,
  commentsSection,
  commentTextarea
) {
  console.log('📝 submitComment called with:', {
    url,
    comment: comment.substring(0, 50) + '...',
    commentsSection: !!commentsSection,
    commentTextarea: !!commentTextarea,
  });

  // Check if Firebase is available, otherwise use local functionality
  if (
    typeof window.FirebaseService === 'undefined' ||
    !window.FirebaseService.isUserAuthenticated
  ) {
    console.log('🏠 Firebase not available, using local submission');
    if (window.submitCommentLocal) {
      return window.submitCommentLocal(
        url,
        comment,
        commentsSection,
        commentTextarea
      );
    }
  }

  // Show submitting state
  const submitBtn = document.getElementById('submit-comment-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    console.log('🔍 Checking Firebase service availability...');
    // Check if Firebase service is available
    if (typeof window.FirebaseService === 'undefined') {
      throw new Error(
        'Firebase service is not available. Please refresh the page and try again.'
      );
    }
    console.log('✅ Firebase service is available');

    console.log('🔐 Checking authentication state...');
    // Check authentication state first
    if (!window.FirebaseService.isUserAuthenticated()) {
      console.log(
        '⚠️ User not authenticated, attempting to re-authenticate...'
      );
      if (window.updateUserStatus) {
        window.updateUserStatus('🔄 Re-authenticating...');
      }

      const user = await window.FirebaseService.initAuth();
      if (!user) {
        throw new Error(
          'Authentication failed. Please refresh the page and try again.'
        );
      }
      console.log('✅ Re-authentication successful');
      if (window.updateUserStatus) {
        window.updateUserStatus('✅ Connected anonymously');
      }
    } else {
      console.log('✅ User is already authenticated');
    }

    // Validate input data
    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    if (comment.length > 5000) {
      throw new Error('Comment is too long (maximum 5000 characters)');
    }

    console.log('📊 Preparing comment data...');
    const commentData = {
      author: 'Anonymous', // In a real app, this would be the logged-in user
      text: comment.trim(),
      votes: 0,
      timestamp: new Date().toISOString(),
    };

    console.log('💾 Saving comment to Firebase...');
    // Save comment to Firebase with detailed logging
    const commentId = await window.FirebaseService.saveComment(
      url,
      commentData
    );
    console.log('✅ Comment saved successfully with ID:', commentId);

    // Clear the textarea
    commentTextarea.value = '';

    // Show success message
    if (window.showNotification) {
      window.showNotification('Comment submitted successfully! 🎉', 'success');
    }

    console.log('🔄 Reloading comments to show new comment...');
    // Reload comments to show the new one
    await loadCommentsForUrl(url, commentsSection);
  } catch (error) {
    console.error('❌ Error submitting comment:', error);

    // Log detailed error information
    console.error('📊 Detailed error info:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Show user-friendly error message
    let errorMessage = 'Failed to submit comment. ';

    if (
      error.message.includes('authentication') ||
      error.message.includes('auth')
    ) {
      errorMessage += 'Please refresh the page and try again.';
    } else if (
      error.message.includes('network') ||
      error.message.includes('connection')
    ) {
      errorMessage += 'Please check your internet connection and try again.';
    } else if (
      error.message.includes('permission') ||
      error.message.includes('denied')
    ) {
      errorMessage +=
        'Permission denied. Please refresh the page and try again.';
    } else {
      errorMessage += error.message;
    }

    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }

    // Log to debug logger if available
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Comment submission failed: ${error.message}`,
        'COMMENTS',
        error
      );
    }
  } finally {
    // Reset submit button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Scroll to comments section
    scrollToNewComment(commentsSection);
  }
}
