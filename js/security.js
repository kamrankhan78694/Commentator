/**
 * Security Utilities for Commentator
 * Provides input validation, sanitization, and security checks
 */

window.SecurityUtils = (function () {
  'use strict';

  // XSS Prevention patterns
  const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
  ];

  // SQL Injection patterns
  const SQL_INJECTION_PATTERNS = [
    /('|(\\')|(;)|(\\;)|(\/\*)|(\\*)|(\/\*)|(\*\/)|(\bselect\b)|(\binsert\b)|(\bupdate\b)|(\bdelete\b)|(\bdrop\b)|(\bcreate\b)|(\balter\b)|(\bexec\b)|(\bunion\b)|(\bjoin\b))/gi,
  ];

  // Profanity and spam patterns
  const SPAM_PATTERNS = [
    /(.)\1{20,}/g, // Repeated characters
    /https?:\/\/[^\s]{1,3}\.[^\s]{1,3}/g, // Suspicious short URLs
    /\b(buy|cheap|free|money|click here|act now)\b/gi, // Common spam words
  ];

  /**
   * Sanitize text input to prevent XSS attacks
   * @param {string} input - The input text to sanitize
   * @returns {string} - Sanitized text
   */
  function sanitizeText(input) {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove XSS patterns
    XSS_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Encode HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  /**
   * Validate comment text
   * @param {string} text - Comment text to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  function validateComment(text) {
    const errors = [];

    if (!text || typeof text !== 'string') {
      errors.push('Comment text is required');
      return { valid: false, errors };
    }

    if (text.length === 0) {
      errors.push('Comment cannot be empty');
    }

    if (text.length > 5000) {
      errors.push('Comment is too long (maximum 5000 characters)');
    }

    if (text.length < 3) {
      errors.push('Comment is too short (minimum 3 characters)');
    }

    // Check for XSS patterns
    XSS_PATTERNS.forEach((pattern) => {
      if (pattern.test(text)) {
        errors.push('Comment contains potentially dangerous content');
      }
    });

    // Check for SQL injection patterns
    SQL_INJECTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(text)) {
        errors.push('Comment contains invalid characters');
      }
    });

    // Check for spam patterns
    SPAM_PATTERNS.forEach((pattern) => {
      if (pattern.test(text)) {
        errors.push('Comment appears to be spam');
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate author name
   * @param {string} author - Author name to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  function validateAuthor(author) {
    const errors = [];

    if (!author || typeof author !== 'string') {
      errors.push('Author name is required');
      return { valid: false, errors };
    }

    if (author.length === 0) {
      errors.push('Author name cannot be empty');
    }

    if (author.length > 100) {
      errors.push('Author name is too long (maximum 100 characters)');
    }

    if (author.length < 2) {
      errors.push('Author name is too short (minimum 2 characters)');
    }

    // Check for HTML/script content
    if (/<[^>]*>/g.test(author)) {
      errors.push('Author name cannot contain HTML tags');
    }

    // Check for reserved names
    const reservedNames = [
      'admin',
      'root',
      'system',
      'moderator',
      'anonymous',
      'null',
      'undefined',
    ];
    if (reservedNames.some((name) => author.toLowerCase().includes(name))) {
      errors.push('Author name contains reserved words');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  function validateEmail(email) {
    const errors = [];

    if (!email || typeof email !== 'string') {
      return { valid: true, errors }; // Email is optional
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    if (email.length > 255) {
      errors.push('Email is too long (maximum 255 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate wallet address (Ethereum format)
   * @param {string} address - Wallet address to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  function validateWalletAddress(address) {
    const errors = [];

    if (!address || typeof address !== 'string') {
      return { valid: true, errors }; // Wallet address is optional
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      errors.push('Invalid wallet address format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rate limiting check (simple client-side implementation)
   * @param {string} key - Unique key for rate limiting
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if request is allowed
   */
  function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `rl_${key}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const requests = stored ? JSON.parse(stored) : [];

      // Filter out old requests
      const recentRequests = requests.filter(
        (timestamp) => now - timestamp < windowMs
      );

      if (recentRequests.length >= maxRequests) {
        return false;
      }

      // Add current request
      recentRequests.push(now);
      localStorage.setItem(storageKey, JSON.stringify(recentRequests));

      return true;
    } catch (error) {
      console.warn('Rate limiting check failed:', error);
      return true; // Allow request if rate limiting fails
    }
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of random string
   * @returns {string} - Random string
   */
  function generateSecureId(length = 32) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Check if content is likely spam
   * @param {string} content - Content to check
   * @returns {{isSpam: boolean, reasons: string[]}}
   */
  function detectSpam(content) {
    const reasons = [];

    if (!content || typeof content !== 'string') {
      return { isSpam: false, reasons };
    }

    // Check for excessive repetition
    if (/(.)\1{10,}/g.test(content)) {
      reasons.push('Excessive character repetition');
    }

    // Check for too many links
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) {
      reasons.push('Too many links');
    }

    // Check for spam keywords
    const spamKeywords = [
      'buy now',
      'click here',
      'free money',
      'amazing deal',
      'limited time',
    ];
    const lowerContent = content.toLowerCase();
    const foundSpamWords = spamKeywords.filter((keyword) =>
      lowerContent.includes(keyword)
    );
    if (foundSpamWords.length > 0) {
      reasons.push(`Contains spam keywords: ${foundSpamWords.join(', ')}`);
    }

    // Check for excessive capitalization
    const uppercaseRatio =
      (content.match(/[A-Z]/g) || []).length / content.length;
    if (uppercaseRatio > 0.7 && content.length > 20) {
      reasons.push('Excessive capitalization');
    }

    return {
      isSpam: reasons.length > 0,
      reasons,
    };
  }

  // Public API
  return {
    sanitizeText,
    validateComment,
    validateAuthor,
    validateEmail,
    validateWalletAddress,
    checkRateLimit,
    generateSecureId,
    detectSpam,
  };
})();

// Log initialization
if (window.CommentatorLogger) {
  window.CommentatorLogger.info('Security utilities initialized', 'SECURITY');
}
