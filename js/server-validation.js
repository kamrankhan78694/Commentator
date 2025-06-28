/**
 * Server-Side Validation Module for Commentator
 * Provides comprehensive input validation and sanitization
 * This would typically run in a Node.js server or Firebase Cloud Functions
 */

window.ServerValidation = (function() {
  'use strict';

  // Import security utilities if available
  const SecurityUtils = window.SecurityUtils || {};

  /**
   * Comprehensive comment validation
   * @param {Object} commentData - Comment data to validate
   * @param {Object} context - Request context (user, session, etc.)
   * @returns {Object} Validation result
   */
  function validateComment(commentData, context = {}) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!commentData.text || typeof commentData.text !== 'string') {
      errors.push('Comment text is required and must be a string');
    }

    if (!commentData.author || typeof commentData.author !== 'string') {
      errors.push('Author is required and must be a string');
    }

    if (!commentData.timestamp) {
      errors.push('Timestamp is required');
    }

    // Length validation
    if (commentData.text && commentData.text.length > 5000) {
      errors.push('Comment text must not exceed 5000 characters');
    }

    if (commentData.text && commentData.text.length < 1) {
      errors.push('Comment text must not be empty');
    }

    if (commentData.author && commentData.author.length > 100) {
      errors.push('Author name must not exceed 100 characters');
    }

    // Content validation using security utilities
    if (commentData.text && SecurityUtils.validateComment) {
      const contentValidation = SecurityUtils.validateComment(commentData.text);
      if (!contentValidation.valid) {
        errors.push(...contentValidation.errors);
      }
      if (contentValidation.warnings) {
        warnings.push(...contentValidation.warnings);
      }
    }

    // URL validation if URL is provided
    if (commentData.url) {
      if (!isValidURL(commentData.url)) {
        errors.push('Invalid URL format');
      }
    }

    // Email validation if email is provided
    if (commentData.email) {
      if (!isValidEmail(commentData.email)) {
        errors.push('Invalid email format');
      }
    }

    // Rate limiting check
    if (context.userId) {
      const rateLimitResult = checkRateLimit(context.userId, 'comment_submission');
      if (!rateLimitResult.allowed) {
        errors.push(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`);
      }
    }

    // CSRF token validation
    if (context.csrfToken) {
      if (!window.SecurityMiddleware || !window.SecurityMiddleware.validateCSRFToken(context.csrfToken)) {
        errors.push('Invalid CSRF token');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitized: errors.length === 0 ? sanitizeCommentData(commentData) : null
    };
  }

  /**
   * Sanitize comment data
   * @param {Object} commentData - Raw comment data
   * @returns {Object} Sanitized comment data
   */
  function sanitizeCommentData(commentData) {
    const sanitized = { ...commentData };

    // Sanitize text content
    if (SecurityUtils.sanitizeText) {
      sanitized.text = SecurityUtils.sanitizeText(commentData.text);
      sanitized.author = SecurityUtils.sanitizeText(commentData.author);
    }

    // Ensure timestamp is valid
    if (!sanitized.timestamp || isNaN(new Date(sanitized.timestamp))) {
      sanitized.timestamp = new Date().toISOString();
    }

    // Remove any potentially dangerous fields
    delete sanitized.script;
    delete sanitized.onclick;
    delete sanitized.onerror;
    delete sanitized.onload;

    // Normalize URL
    if (sanitized.url) {
      sanitized.url = normalizeURL(sanitized.url);
    }

    return sanitized;
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  function isValidURL(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Normalize URL
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  function normalizeURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Check rate limiting for user actions
   * @param {string} userId - User identifier
   * @param {string} action - Action type
   * @returns {Object} Rate limit result
   */
  function checkRateLimit(userId, action) {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;

    // Get stored requests for this user/action
    const stored = sessionStorage.getItem(`rateLimit_${key}`);
    let requests = stored ? JSON.parse(stored) : [];

    // Remove old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < windowMs);

    if (requests.length >= maxRequests) {
      const oldestRequest = Math.min(...requests);
      const retryAfter = Math.ceil((windowMs - (now - oldestRequest)) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request
    requests.push(now);
    sessionStorage.setItem(`rateLimit_${key}`, JSON.stringify(requests));

    return { allowed: true, retryAfter: 0 };
  }

  /**
   * Validate user session
   * @param {Object} sessionData - Session data to validate
   * @returns {Object} Validation result
   */
  function validateSession(sessionData) {
    const errors = [];

    if (!sessionData.sessionId) {
      errors.push('Session ID is required');
    }

    if (!sessionData.userId) {
      errors.push('User ID is required');
    }

    if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      errors.push('Session has expired');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate authentication data
   * @param {Object} authData - Authentication data
   * @returns {Object} Validation result
   */
  function validateAuth(authData) {
    const errors = [];

    if (!authData.token) {
      errors.push('Authentication token is required');
    }

    if (authData.token && authData.token.length < 10) {
      errors.push('Authentication token is too short');
    }

    // Additional auth validation would go here
    // (token signature verification, expiration, etc.)

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Public API
  return {
    validateComment,
    validateSession,
    validateAuth,
    sanitizeCommentData,
    isValidURL,
    isValidEmail,
    checkRateLimit
  };
})();

// Log initialization
if (window.CommentatorLogger) {
  window.CommentatorLogger.info('Server validation module loaded', 'VALIDATION');
}