/**
 * Input Validation and Sanitization Utilities
 * Comprehensive security-focused input handling for Commentator
 */

/**
 * HTML sanitization configuration
 */
const HTML_SANITIZE_CONFIG = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
  allowedAttributes: {},
  removeEmpty: true,
  trimWhitespace: true
}

/**
 * Security patterns for validation
 */
const SECURITY_PATTERNS = {
  // Potentially malicious patterns
  script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  iframe: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  javascript: /javascript:/gi,
  onEvent: /\bon\w+\s*=/gi,
  dataUri: /data:\s*[^;]*;base64/gi,

  // SQL injection patterns
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)|(['";])|(\-\-)|(\#)/gi,

  // XSS patterns
  xssScript: /(<script[^>]*>.*?<\/script>)|(<script[^>]*\/>)/gi,
  xssImg: /<img[^>]+src[^>]*=\s*["']?[^"']*javascript:/gi,
  xssObject: /<object[^>]*>.*?<\/object>/gi,

  // Valid patterns
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9_-]+$/,
  displayName: /^[a-zA-Z0-9\s._-]{1,50}$/
}

/**
 * Validation error types
 */
export const ValidationError = {
  REQUIRED: 'REQUIRED',
  TOO_LONG: 'TOO_LONG',
  TOO_SHORT: 'TOO_SHORT',
  INVALID_FORMAT: 'INVALID_FORMAT',
  CONTAINS_HTML: 'CONTAINS_HTML',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  RATE_LIMITED: 'RATE_LIMITED'
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml (input) {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Remove script tags and content
  sanitized = sanitized.replace(SECURITY_PATTERNS.script, '')

  // Remove iframe tags
  sanitized = sanitized.replace(SECURITY_PATTERNS.iframe, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(SECURITY_PATTERNS.javascript, '')

  // Remove event handlers
  sanitized = sanitized.replace(SECURITY_PATTERNS.onEvent, '')

  // Remove data URIs
  sanitized = sanitized.replace(SECURITY_PATTERNS.dataUri, '')

  // Remove other XSS patterns
  sanitized = sanitized.replace(SECURITY_PATTERNS.xssScript, '')
  sanitized = sanitized.replace(SECURITY_PATTERNS.xssImg, '')
  sanitized = sanitized.replace(SECURITY_PATTERNS.xssObject, '')

  // Escape remaining HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return sanitized.trim()
}

/**
 * Validate comment text
 */
export function validateComment (text) {
  const errors = []

  // Required field
  if (!text || typeof text !== 'string') {
    errors.push({ type: ValidationError.REQUIRED, field: 'text', message: 'Comment text is required' })
    return { valid: false, errors, sanitized: '' }
  }

  // Length validation
  if (text.length === 0) {
    errors.push({ type: ValidationError.TOO_SHORT, field: 'text', message: 'Comment cannot be empty' })
  }

  if (text.length > 5000) {
    errors.push({ type: ValidationError.TOO_LONG, field: 'text', message: 'Comment too long (max 5000 characters)' })
  }

  // Security validation
  if (SECURITY_PATTERNS.script.test(text) ||
      SECURITY_PATTERNS.iframe.test(text) ||
      SECURITY_PATTERNS.javascript.test(text)) {
    errors.push({ type: ValidationError.SECURITY_VIOLATION, field: 'text', message: 'Comment contains potentially dangerous content' })
  }

  // SQL injection detection
  if (SECURITY_PATTERNS.sqlInjection.test(text)) {
    errors.push({ type: ValidationError.SECURITY_VIOLATION, field: 'text', message: 'Comment contains potentially malicious patterns' })
  }

  // Sanitize the text
  const sanitized = sanitizeHtml(text)

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Validate display name
 */
export function validateDisplayName (name) {
  const errors = []

  if (!name || typeof name !== 'string') {
    errors.push({ type: ValidationError.REQUIRED, field: 'displayName', message: 'Display name is required' })
    return { valid: false, errors, sanitized: '' }
  }

  if (name.length === 0) {
    errors.push({ type: ValidationError.TOO_SHORT, field: 'displayName', message: 'Display name cannot be empty' })
  }

  if (name.length > 50) {
    errors.push({ type: ValidationError.TOO_LONG, field: 'displayName', message: 'Display name too long (max 50 characters)' })
  }

  if (!SECURITY_PATTERNS.displayName.test(name)) {
    errors.push({ type: ValidationError.INVALID_FORMAT, field: 'displayName', message: 'Display name contains invalid characters' })
  }

  const sanitized = sanitizeHtml(name)

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Validate email address
 */
export function validateEmail (email) {
  const errors = []

  if (!email || typeof email !== 'string') {
    return { valid: true, errors: [], sanitized: '' } // Email is optional
  }

  if (!SECURITY_PATTERNS.email.test(email)) {
    errors.push({ type: ValidationError.INVALID_FORMAT, field: 'email', message: 'Invalid email format' })
  }

  if (email.length > 254) {
    errors.push({ type: ValidationError.TOO_LONG, field: 'email', message: 'Email address too long' })
  }

  const sanitized = email.toLowerCase().trim()

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Validate URL
 */
export function validateUrl (url) {
  const errors = []

  if (!url || typeof url !== 'string') {
    errors.push({ type: ValidationError.REQUIRED, field: 'url', message: 'URL is required' })
    return { valid: false, errors, sanitized: '' }
  }

  if (!SECURITY_PATTERNS.url.test(url)) {
    errors.push({ type: ValidationError.INVALID_FORMAT, field: 'url', message: 'Invalid URL format' })
  }

  if (url.length > 2083) {
    errors.push({ type: ValidationError.TOO_LONG, field: 'url', message: 'URL too long' })
  }

  // Additional security checks for URLs
  if (SECURITY_PATTERNS.javascript.test(url)) {
    errors.push({ type: ValidationError.SECURITY_VIOLATION, field: 'url', message: 'URL contains potentially dangerous content' })
  }

  const sanitized = url.trim()

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Rate limiting tracker
 */
class RateLimiter {
  constructor () {
    this.attempts = new Map()
  }

  isRateLimited (identifier, limit, windowMs) {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!this.attempts.has(identifier)) {
      this.attempts.set(identifier, [])
    }

    const userAttempts = this.attempts.get(identifier)

    // Remove attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => timestamp > windowStart)
    this.attempts.set(identifier, validAttempts)

    // Check if limit exceeded
    if (validAttempts.length >= limit) {
      return true
    }

    // Record this attempt
    validAttempts.push(now)
    return false
  }

  reset (identifier) {
    this.attempts.delete(identifier)
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

/**
 * Comprehensive validation for comment submission
 */
export function validateCommentSubmission (data, userIdentifier) {
  const errors = []

  // Rate limiting check
  if (rateLimiter.isRateLimited(userIdentifier, 5, 60000)) { // 5 per minute
    errors.push({
      type: ValidationError.RATE_LIMITED,
      field: 'submission',
      message: 'Too many comments submitted. Please wait before trying again.'
    })
  }

  // Validate individual fields
  const textValidation = validateComment(data.text)
  const nameValidation = validateDisplayName(data.author)
  const emailValidation = validateEmail(data.email)

  // Collect all errors
  errors.push(...textValidation.errors)
  errors.push(...nameValidation.errors)
  errors.push(...emailValidation.errors)

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      text: textValidation.sanitized,
      author: nameValidation.sanitized,
      email: emailValidation.sanitized
    }
  }
}

/**
 * Generate secure random token
 */
export function generateSecureToken (length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken () {
  const token = generateSecureToken(32)

  // Store in sessionStorage for single-session use
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('csrfToken', token)
  }

  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken (token) {
  if (typeof sessionStorage === 'undefined') {
    return false
  }

  const storedToken = sessionStorage.getItem('csrfToken')
  return storedToken && storedToken === token
}
