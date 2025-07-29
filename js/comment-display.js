/**
 * Comment Display Module
 *
 * Handles comment display, formatting, and UI rendering
 * for the Commentator application.
 *
 * @module CommentDisplay
 */

/**
 * Display comments in the comments section
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

  const commentsHtml = comments
    .map((comment) => {
      if (comment.isNFT || isNFT) {
        const shortAddress =
          comment.author.length > 10
            ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
            : comment.author;

        return `
                <div class="comment nft-comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${shortAddress}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                        <span class="nft-badge">🖼️ NFT #${comment.nftId || comment.id}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="nft-info">
                        <small>
                            <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
                            | Wallet: <span title="${comment.author}">${shortAddress}</span>
                        </small>
                    </div>
                </div>
            `;
      } else {
        return `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${comment.author}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
      }
    })
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
  if (comment.isNFT || isNFT) {
    const shortAddress =
      comment.author.length > 10
        ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
        : comment.author;

    return `
      <div class="comment nft-comment">
          <div class="comment-header">
              <span class="comment-author">👤 ${shortAddress}</span>
              <span class="comment-timestamp">${comment.timestamp}</span>
              <span class="comment-votes">👍 ${comment.votes}</span>
              <span class="nft-badge">🖼️ NFT #${comment.nftId || comment.id}</span>
          </div>
          <div class="comment-text">${comment.text}</div>
          <div class="nft-info">
              <small>
                  <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
                  | Wallet: <span title="${comment.author}">${shortAddress}</span>
              </small>
          </div>
      </div>
    `;
  } else {
    return `
      <div class="comment">
          <div class="comment-header">
              <span class="comment-author">👤 ${comment.author}</span>
              <span class="comment-timestamp">${comment.timestamp}</span>
              <span class="comment-votes">👍 ${comment.votes}</span>
          </div>
          <div class="comment-text">${comment.text}</div>
      </div>
    `;
  }
}
