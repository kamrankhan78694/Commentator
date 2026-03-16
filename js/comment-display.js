/**
 * Comment Display Module
 *
 * Handles comment display, formatting, and UI rendering
 * for the Commentator application. Supports threaded/nested
 * comments and moderation actions (reply, edit, delete, flag).
 *
 * @module CommentDisplay
 */

/**
 * Build a tree structure from flat comments using parentId
 * @param {Array} comments - Flat array of comment objects
 * @param {number} maxDepth - Maximum nesting depth (default 3)
 * @returns {Array} - Array of root comments with nested replies
 */
function buildCommentTree(comments, maxDepth = 3) {
  const map = {};
  const roots = [];

  // Index all comments by id
  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  // Build tree
  comments.forEach((c) => {
    const node = map[c.id];
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(node);
    } else {
      roots.push(node);
    }
  });

  // Trim depth beyond maxDepth (flatten deeply nested replies)
  // Note: operates on the already-copied tree nodes, safe to mutate
  function trimDepth(nodes, depth) {
    for (let i = 0; i < nodes.length; i++) {
      if (depth >= maxDepth) {
        nodes[i] = { ...nodes[i], replies: [] };
      } else {
        trimDepth(nodes[i].replies, depth + 1);
      }
    }
  }
  trimDepth(roots, 1);

  return roots;
}

/**
 * Render a single comment as HTML
 * @param {Object} comment - The comment object
 * @param {boolean} isNFT - Whether this is an NFT comment
 * @param {number} depth - Current nesting depth
 * @param {string|null} currentUserId - The authenticated user's ID (for edit/delete)
 * @returns {string} - HTML string
 */
function renderComment(comment, isNFT, depth, currentUserId) {
  if (comment.status === 'deleted') {
    return `
      <div class="comment comment-deleted" data-comment-id="${comment.id}" data-depth="${depth}">
        <div class="comment-header">
          <span class="comment-author">👤 ${comment.author || 'Unknown'}</span>
          <span class="comment-timestamp">${comment.timestamp}</span>
        </div>
        <div class="comment-text comment-text-deleted"><em>[This comment has been deleted]</em></div>
        ${renderReplies(comment.replies || [], isNFT, depth, currentUserId)}
      </div>
    `;
  }

  const isOwner = currentUserId && comment.userId === currentUserId;
  const editedBadge = comment.isEdited
    ? '<span class="edited-badge">(edited)</span>'
    : '';
  const flaggedBadge =
    comment.flagCount && comment.flagCount >= 3
      ? '<span class="flagged-badge">⚠️ Under Review</span>'
      : '';

  if (comment.isNFT || isNFT) {
    const shortAddress =
      comment.author.length > 10
        ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
        : comment.author;

    return `
      <div class="comment nft-comment" data-comment-id="${comment.id}" data-depth="${depth}">
        <div class="comment-header">
          <span class="comment-author">👤 ${shortAddress}</span>
          <span class="comment-timestamp">${comment.timestamp}</span>
          <span class="comment-votes">
            <button class="btn-action btn-vote btn-upvote" data-comment-id="${comment.id}" title="Upvote">👍</button>
            <span class="vote-count">${comment.votes || 0}</span>
            <button class="btn-action btn-vote btn-downvote" data-comment-id="${comment.id}" title="Downvote">👎</button>
          </span>
          <span class="nft-badge">🖼️ NFT #${comment.nftId || comment.id}</span>
          ${editedBadge}
          ${flaggedBadge}
        </div>
        <div class="comment-text">${comment.text || comment.content || ''}</div>
        <div class="nft-info">
          <small>
            <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
            | Wallet: <span title="${comment.author}">${shortAddress}</span>
          </small>
        </div>
        <div class="comment-action-bar">
          ${depth < 3 ? `<button class="btn-action btn-reply" data-comment-id="${comment.id}" title="Reply">↩ Reply</button>` : ''}
          ${isOwner ? `<button class="btn-action btn-edit" data-comment-id="${comment.id}" title="Edit">✏️ Edit</button>` : ''}
          ${isOwner ? `<button class="btn-action btn-delete" data-comment-id="${comment.id}" title="Delete">🗑️ Delete</button>` : ''}
          ${!isOwner ? `<button class="btn-action btn-flag" data-comment-id="${comment.id}" title="Flag">🚩 Flag</button>` : ''}
        </div>
        <div class="reply-form-container" id="reply-form-${comment.id}" style="display:none;"></div>
        ${renderReplies(comment.replies || [], isNFT, depth, currentUserId)}
      </div>
    `;
  } else {
    return `
      <div class="comment" data-comment-id="${comment.id}" data-depth="${depth}">
        <div class="comment-header">
          <span class="comment-author">👤 ${comment.author}</span>
          <span class="comment-timestamp">${comment.timestamp}</span>
          <span class="comment-votes">
            <button class="btn-action btn-vote btn-upvote" data-comment-id="${comment.id}" title="Upvote">👍</button>
            <span class="vote-count">${comment.votes || 0}</span>
            <button class="btn-action btn-vote btn-downvote" data-comment-id="${comment.id}" title="Downvote">👎</button>
          </span>
          ${editedBadge}
          ${flaggedBadge}
        </div>
        <div class="comment-text">${comment.text || comment.content || ''}</div>
        <div class="comment-action-bar">
          ${depth < 3 ? `<button class="btn-action btn-reply" data-comment-id="${comment.id}" title="Reply">↩ Reply</button>` : ''}
          ${isOwner ? `<button class="btn-action btn-edit" data-comment-id="${comment.id}" title="Edit">✏️ Edit</button>` : ''}
          ${isOwner ? `<button class="btn-action btn-delete" data-comment-id="${comment.id}" title="Delete">🗑️ Delete</button>` : ''}
          ${!isOwner ? `<button class="btn-action btn-flag" data-comment-id="${comment.id}" title="Flag">🚩 Flag</button>` : ''}
        </div>
        <div class="reply-form-container" id="reply-form-${comment.id}" style="display:none;"></div>
        ${renderReplies(comment.replies || [], isNFT, depth, currentUserId)}
      </div>
    `;
  }
}

/**
 * Render replies recursively
 * @param {Array} replies - Array of reply comment objects
 * @param {boolean} isNFT - Whether to render as NFT
 * @param {number} parentDepth - Parent nesting depth
 * @param {string|null} currentUserId - The authenticated user's ID
 * @returns {string} - HTML string of nested replies
 */
function renderReplies(replies, isNFT, parentDepth, currentUserId) {
  if (!replies || replies.length === 0) return '';
  const childDepth = parentDepth + 1;
  const repliesHtml = replies
    .map((reply) => renderComment(reply, isNFT, childDepth, currentUserId))
    .join('');
  return `<div class="comment-replies">${repliesHtml}</div>`;
}

/**
 * Display comments in the comments section (supports threading)
 * @param {Array} comments - Array of comment objects
 * @param {HTMLElement} commentsSection - The element to display comments in
 * @param {boolean} isNFT - Whether to render as NFT comments
 */
export function displayComments(comments, commentsSection, isNFT = false) {
  if (comments.length === 0) {
    commentsSection.innerHTML = `
            <div class="no-comments">
                <p>No comments yet for this URL. Be the first to share your thoughts!</p>
            </div>
        `;
    return;
  }

  // Get current user ID for showing edit/delete buttons
  let currentUserId = null;
  if (
    typeof window !== 'undefined' &&
    window.FirebaseService &&
    window.FirebaseService.getCurrentUser
  ) {
    const user = window.FirebaseService.getCurrentUser();
    if (user) currentUserId = user.uid;
  }

  // Build threaded tree and render
  const tree = buildCommentTree(comments);
  const commentsHtml = tree
    .map((comment) => renderComment(comment, isNFT, 1, currentUserId))
    .join('');

  commentsSection.innerHTML = `
        <div class="comments-list">
            <h4>💬 Comments (${comments.length})</h4>
            ${commentsHtml}
        </div>
    `;
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted time string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown time';

  const now = Date.now();
  const diff = now - timestamp;

  // Convert to seconds
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  // For older dates, show actual date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Display a local comment in the UI
 * @param {Object} comment - The comment object to display
 * @param {HTMLElement} commentsSection - The comments section element
 */
export function displayLocalComment(comment, commentsSection) {
  const existingComments = commentsSection.querySelector('.comments-list');

  const localCommentHtml = `
    <div class="comment local-comment new-comment">
      <div class="comment-header">
        <span class="comment-author">👤 ${comment.author}</span>
        <span class="comment-timestamp">${comment.timestamp}</span>
        <span class="comment-votes">👍 ${comment.votes}</span>
        <span class="local-badge">🏠 Local</span>
      </div>
      <div class="comment-text">${comment.text}</div>
    </div>
  `;

  if (existingComments) {
    existingComments.insertAdjacentHTML('afterbegin', localCommentHtml);
  } else {
    displayComments([comment], commentsSection, false);
  }

  // Scroll to the new comment
  setTimeout(() => {
    const newCommentElement = commentsSection.querySelector('.new-comment');
    if (newCommentElement) {
      newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        newCommentElement.classList.remove('new-comment');
      }, 3000);
    }
  }, 100);
}

/**
 * Initialize comment-related styles
 */
export function initCommentStyles() {
  const commentStyles = `
    .nft-comment {
      border-left: 4px solid #3182ce;
      background: linear-gradient(45deg, #f7fafc, #edf2f7);
    }
    
    .nft-badge {
      background: #3182ce;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      margin-left: 8px;
    }
    
    .local-comment {
      border-left: 4px solid #38a169;
      background: #f0fff4;
    }
    
    .local-badge {
      background: #38a169;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      margin-left: 8px;
    }

    /* Threaded / nested replies */
    .comment-replies {
      margin-left: 24px;
      padding-left: 16px;
      border-left: 2px solid #e2e8f0;
      margin-top: 8px;
    }

    .comment[data-depth="2"] {
      background: #f9fafb;
    }

    .comment[data-depth="3"] {
      background: #f3f4f6;
    }

    /* Action bar for reply, edit, delete, flag */
    .comment-action-bar {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .btn-action {
      background: none;
      border: 1px solid #e2e8f0;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8em;
      color: #4a5568;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    .btn-reply:hover { color: #3182ce; border-color: #3182ce; }
    .btn-edit:hover { color: #d69e2e; border-color: #d69e2e; }
    .btn-delete:hover { color: #e53e3e; border-color: #e53e3e; }
    .btn-flag:hover { color: #dd6b20; border-color: #dd6b20; }

    /* Edited & flagged badges */
    .edited-badge {
      font-size: 0.75em;
      color: #718096;
      font-style: italic;
      margin-left: 4px;
    }

    .flagged-badge {
      font-size: 0.75em;
      color: #dd6b20;
      background: #fffbeb;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 4px;
    }

    /* Deleted comment styling */
    .comment-deleted {
      opacity: 0.6;
    }

    .comment-text-deleted {
      color: #a0aec0;
    }

    /* Inline reply form */
    .reply-form-container {
      margin-top: 8px;
    }

    .inline-reply-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .inline-reply-form textarea {
      width: 100%;
      min-height: 60px;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.9em;
      resize: vertical;
    }

    .inline-reply-form textarea:focus {
      outline: none;
      border-color: #3182ce;
    }

    .inline-reply-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn-submit-reply {
      background: #3182ce;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85em;
    }

    .btn-submit-reply:hover { background: #2c5282; }

    .btn-cancel-reply {
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85em;
    }

    .btn-cancel-reply:hover { background: #cbd5e0; }

    /* Flag modal */
    .flag-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .flag-modal {
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .flag-modal h3 { margin-bottom: 12px; }

    .flag-modal select,
    .flag-modal textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 12px;
      font-family: inherit;
    }

    .flag-modal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .error-state {
      text-align: center;
      padding: 40px 20px;
      color: #e53e3e;
    }
    
    .error-state button {
      margin-top: 16px;
      background: #e53e3e;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .error-state button:hover {
      background: #c53030;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = commentStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Create loading state HTML
 * @param {string} url - The URL being loaded
 * @returns {string} - HTML for loading state
 */
export function createLoadingState(url) {
  return `
    <div class="loading">
        <p>🔄 Loading comments for ${url}...</p>
    </div>
  `;
}

/**
 * Create error state HTML
 * @param {string} errorMessage - The error message to display
 * @returns {string} - HTML for error state
 */
export function createErrorState(errorMessage) {
  return `
    <div class="error-state">
        <p>❌ Failed to load comments: ${errorMessage}</p>
        <button id="retry-button" class="btn btn-secondary">
            Retry
        </button>
    </div>
  `;
}

/**
 * Scroll to new comment element
 * @param {HTMLElement} commentsSection - The comments section element
 */
export function scrollToNewComment(commentsSection) {
  setTimeout(() => {
    const newCommentElement = commentsSection.querySelector('.new-comment');
    if (newCommentElement) {
      newCommentElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setTimeout(() => {
        newCommentElement.classList.remove('new-comment');
      }, 3000);
    }
  }, 100);
}

/**
 * Generate comment HTML for different types
 * @param {Object} comment - The comment object
 * @param {boolean} isNFT - Whether this is an NFT comment
 * @returns {string} - HTML string for the comment
 */
export function generateCommentHTML(comment, isNFT = false) {
  return renderComment(comment, isNFT, 1, null);
}
