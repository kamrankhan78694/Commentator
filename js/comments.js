/**
 * Comments Module
 *
 * Handles comment interface functionality, comment loading, submission,
 * and moderation actions (reply, edit, delete, flag) for the Commentator application.
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

// Track which elements have had comment action listeners attached
const elementsWithActions = new WeakSet();

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
 * Set up event delegation for comment action buttons (reply, edit, delete, flag)
 * @param {HTMLElement} commentsSection - The comments container element
 * @param {string} currentUrl - The current URL for comment operations
 */
function setupCommentActions(commentsSection, currentUrl) {
  // Use event delegation on the comments section
  commentsSection.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-action');
    if (!target) return;

    const commentId = target.dataset.commentId;
    if (!commentId) return;

    if (target.classList.contains('btn-reply')) {
      handleReplyAction(commentId, currentUrl, commentsSection);
    } else if (target.classList.contains('btn-edit')) {
      handleEditAction(commentId, currentUrl, commentsSection);
    } else if (target.classList.contains('btn-delete')) {
      handleDeleteAction(commentId, currentUrl, commentsSection);
    } else if (target.classList.contains('btn-flag')) {
      handleFlagAction(commentId, currentUrl);
    } else if (target.classList.contains('btn-upvote')) {
      handleVoteAction(commentId, currentUrl, 'upvote');
    } else if (target.classList.contains('btn-downvote')) {
      handleVoteAction(commentId, currentUrl, 'downvote');
    }
  });
}

/**
 * Handle vote button click (upvote or downvote)
 * @param {string} commentId - The comment ID
 * @param {string} url - The current URL
 * @param {string} voteType - 'upvote' or 'downvote'
 */
async function handleVoteAction(commentId, url, voteType) {
  try {
    if (
      window.FirebaseService &&
      typeof window.FirebaseService.voteComment === 'function'
    ) {
      await window.FirebaseService.voteComment(url, commentId, voteType);
    } else {
      // Fall back to updating the DOM locally
      const btn = document.querySelector(
        `.btn-${voteType}[data-comment-id="${commentId}"]`
      );
      if (btn) {
        const voteCountEl =
          btn.closest('.comment-votes')?.querySelector('.vote-count');
        if (voteCountEl) {
          let count = parseInt(voteCountEl.textContent, 10) || 0;
          count += voteType === 'upvote' ? 1 : -1;
          voteCountEl.textContent = count;
        }
      }
    }

    if (window.showNotification) {
      window.showNotification(
        voteType === 'upvote' ? 'Upvoted! 👍' : 'Downvoted! 👎',
        'success'
      );
    }
  } catch (error) {
    console.error('Vote error:', error);
    if (window.showNotification) {
      window.showNotification('Failed to register vote.', 'error');
    }
  }
}

/**
 * Handle reply button click — show inline reply form
 */
function handleReplyAction(commentId, url, commentsSection) {
  const container = document.getElementById(`reply-form-${commentId}`);
  if (!container) return;

  // Toggle — if already visible, hide it
  if (container.style.display !== 'none' && container.innerHTML.trim()) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="inline-reply-form">
      <textarea id="reply-text-${commentId}" placeholder="Write a reply..." maxlength="5000"></textarea>
      <div class="inline-reply-actions">
        <button class="btn-cancel-reply" id="cancel-reply-${commentId}">Cancel</button>
        <button class="btn-submit-reply" id="submit-reply-${commentId}">Reply</button>
      </div>
    </div>
  `;

  // Focus textarea
  const textarea = document.getElementById(`reply-text-${commentId}`);
  if (textarea) textarea.focus();

  // Cancel button
  document
    .getElementById(`cancel-reply-${commentId}`)
    .addEventListener('click', () => {
      container.style.display = 'none';
      container.innerHTML = '';
    });

  // Submit button
  document
    .getElementById(`submit-reply-${commentId}`)
    .addEventListener('click', async () => {
      const replyText = textarea.value.trim();
      if (!replyText) {
        if (window.showNotification)
          window.showNotification('Please enter a reply', 'error');
        return;
      }

      const submitBtn = document.getElementById(`submit-reply-${commentId}`);
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      try {
        if (typeof window.FirebaseService === 'undefined') {
          throw new Error('Firebase service is not available');
        }

        if (!window.FirebaseService.isUserAuthenticated()) {
          await window.FirebaseService.initAuth();
        }

        const commentData = {
          author: 'Anonymous',
          content: replyText,
          votes: 0,
          timestamp: new Date().toISOString(),
          parentId: commentId,
        };

        await window.FirebaseService.saveComment(url, commentData);

        container.style.display = 'none';
        container.innerHTML = '';

        if (window.showNotification)
          window.showNotification('Reply posted! 🎉', 'success');
        await loadCommentsForUrl(url, commentsSection);
      } catch (error) {
        console.error('❌ Reply failed:', error);
        if (window.showNotification)
          window.showNotification(
            `Failed to post reply: ${error.message}`,
            'error'
          );
        submitBtn.textContent = 'Reply';
        submitBtn.disabled = false;
      }
    });
}

/**
 * Handle edit button click — replace comment text with editable textarea
 */
function handleEditAction(commentId, url, commentsSection) {
  const commentEl = commentsSection.querySelector(
    `[data-comment-id="${commentId}"]`
  );
  if (!commentEl) return;

  const textEl = commentEl.querySelector('.comment-text');
  if (!textEl) return;

  const currentText = textEl.textContent.trim();

  // Replace with edit form
  textEl.innerHTML = `
    <textarea class="edit-textarea" id="edit-text-${commentId}" maxlength="5000">${escapeHtml(currentText)}</textarea>
    <div class="inline-reply-actions" style="margin-top:8px;">
      <button class="btn-cancel-reply" id="cancel-edit-${commentId}">Cancel</button>
      <button class="btn-submit-reply" id="save-edit-${commentId}">Save</button>
    </div>
  `;

  const editTextarea = document.getElementById(`edit-text-${commentId}`);
  if (editTextarea) editTextarea.focus();

  // Cancel
  document
    .getElementById(`cancel-edit-${commentId}`)
    .addEventListener('click', () => {
      textEl.textContent = currentText;
    });

  // Save
  document
    .getElementById(`save-edit-${commentId}`)
    .addEventListener('click', async () => {
      const newText = editTextarea.value.trim();
      if (!newText) {
        if (window.showNotification)
          window.showNotification('Comment cannot be empty', 'error');
        return;
      }

      try {
        const result = await window.FirebaseService.editComment(
          url,
          commentId,
          newText
        );
        if (result.success) {
          if (window.showNotification)
            window.showNotification('Comment updated ✅', 'success');
          await loadCommentsForUrl(url, commentsSection);
        } else {
          if (window.showNotification)
            window.showNotification(result.message, 'error');
          textEl.textContent = currentText;
        }
      } catch (error) {
        console.error('❌ Edit failed:', error);
        if (window.showNotification)
          window.showNotification(`Failed to edit: ${error.message}`, 'error');
        textEl.textContent = currentText;
      }
    });
}

/**
 * Handle delete button click — confirm and soft-delete
 */
function handleDeleteAction(commentId, url, commentsSection) {
  if (
    !confirm(
      'Are you sure you want to delete this comment? This cannot be undone.'
    )
  ) {
    return;
  }

  (async () => {
    try {
      const result = await window.FirebaseService.deleteComment(url, commentId);
      if (result.success) {
        if (window.showNotification)
          window.showNotification('Comment deleted 🗑️', 'success');
        await loadCommentsForUrl(url, commentsSection);
      } else {
        if (window.showNotification)
          window.showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('❌ Delete failed:', error);
      if (window.showNotification)
        window.showNotification(`Failed to delete: ${error.message}`, 'error');
    }
  })();
}

/**
 * Handle flag button click — show flag modal with reason selector
 */
function handleFlagAction(commentId, url) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'flag-modal-overlay';
  overlay.innerHTML = `
    <div class="flag-modal">
      <h3>🚩 Report Comment</h3>
      <select id="flag-reason-select">
        <option value="">Select a reason...</option>
        <option value="spam">Spam</option>
        <option value="harassment">Harassment</option>
        <option value="misinformation">Misinformation</option>
        <option value="inappropriate">Inappropriate content</option>
        <option value="other">Other</option>
      </select>
      <textarea id="flag-details" placeholder="Additional details (optional)..." rows="3"></textarea>
      <div class="flag-modal-actions">
        <button class="btn-cancel-reply" id="flag-cancel">Cancel</button>
        <button class="btn-submit-reply" id="flag-submit" style="background:#dd6b20;">Submit Report</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Cancel
  document.getElementById('flag-cancel').addEventListener('click', () => {
    overlay.remove();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Submit
  document.getElementById('flag-submit').addEventListener('click', async () => {
    const reasonSelect = document.getElementById('flag-reason-select');
    const details = document.getElementById('flag-details').value.trim();
    const reason = reasonSelect.value;

    if (!reason) {
      if (window.showNotification)
        window.showNotification('Please select a reason', 'error');
      return;
    }

    const fullReason = details ? `${reason}: ${details}` : reason;

    try {
      const result = await window.FirebaseService.flagComment(
        url,
        commentId,
        fullReason
      );
      overlay.remove();
      if (result.success) {
        if (window.showNotification)
          window.showNotification('Comment reported. Thank you! 🙏', 'success');
      } else {
        if (window.showNotification)
          window.showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('❌ Flag failed:', error);
      overlay.remove();
      if (window.showNotification)
        window.showNotification(`Failed to report: ${error.message}`, 'error');
    }
  });
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

    // Set up comment action buttons (reply, edit, delete, flag) via event delegation
    // Only set up once per element
    if (!elementsWithActions.has(commentsSection)) {
      setupCommentActions(commentsSection, url);
      elementsWithActions.add(commentsSection);
    }

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

    // Security validation
    let sanitizedComment = comment;
    if (typeof window.SecurityUtils !== 'undefined') {
      // Check rate limiting
      if (!window.SecurityUtils.checkRateLimit('comment_submit', 5, 60000)) {
        throw new Error('You are posting too quickly. Please wait a moment before submitting another comment.');
      }

      // Validate comment content
      const validation = window.SecurityUtils.validateComment(sanitizedComment);
      if (!validation.valid) {
        throw new Error(validation.errors.join('. '));
      }

      // Check for spam
      const spamCheck = window.SecurityUtils.detectSpam(sanitizedComment);
      if (spamCheck.isSpam) {
        throw new Error('Your comment was flagged as potential spam: ' + spamCheck.reasons.join(', '));
      }

      // Sanitize the comment text
      sanitizedComment = window.SecurityUtils.sanitizeText(sanitizedComment);
    }

    console.log('📊 Preparing comment data...');
    const commentData = {
      author: 'Anonymous', // In a real app, this would be the logged-in user
      text: sanitizedComment.trim(),
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
