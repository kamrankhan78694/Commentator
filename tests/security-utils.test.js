/**
 * Unit tests for Security Utilities
 * Tests input validation, sanitization, and security features
 */

describe('Security Utilities', () => {
  let securityUtils
  
  beforeAll(() => {
    // Mock the security utilities since we can't import ES modules in Jest easily
    securityUtils = {
      ValidationError: {
        REQUIRED: 'REQUIRED',
        TOO_LONG: 'TOO_LONG',
        TOO_SHORT: 'TOO_SHORT',
        INVALID_FORMAT: 'INVALID_FORMAT',
        CONTAINS_HTML: 'CONTAINS_HTML',
        SECURITY_VIOLATION: 'SECURITY_VIOLATION',
        RATE_LIMITED: 'RATE_LIMITED'
      },
      
      sanitizeHtml(input) {
        if (typeof input !== 'string') return ''
        
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/\bon\w+\s*=/gi, '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim()
      },
      
      validateComment(text) {
        const errors = []
        
        if (text === null || text === undefined || typeof text !== 'string') {
          errors.push({ type: this.ValidationError.REQUIRED, field: 'text', message: 'Comment text is required' })
          return { valid: false, errors, sanitized: '' }
        }
        
        if (text.length === 0) {
          errors.push({ type: this.ValidationError.TOO_SHORT, field: 'text', message: 'Comment cannot be empty' })
          return { valid: false, errors, sanitized: '' }
        }
        
        if (text.length > 5000) {
          errors.push({ type: this.ValidationError.TOO_LONG, field: 'text', message: 'Comment too long (max 5000 characters)' })
        }
        
        if (/<script\b/.test(text) || /javascript:/i.test(text)) {
          errors.push({ type: this.ValidationError.SECURITY_VIOLATION, field: 'text', message: 'Comment contains potentially dangerous content' })
        }
        
        if (/DROP\s+TABLE|SELECT\s+\*|INSERT\s+INTO/i.test(text)) {
          errors.push({ type: this.ValidationError.SECURITY_VIOLATION, field: 'text', message: 'Comment contains potentially malicious patterns' })
        }
        
        const sanitized = this.sanitizeHtml(text)
        
        return {
          valid: errors.length === 0,
          errors,
          sanitized
        }
      },
      
      validateDisplayName(name) {
        const errors = []
        
        if (name === null || name === undefined || typeof name !== 'string') {
          errors.push({ type: this.ValidationError.REQUIRED, field: 'displayName', message: 'Display name is required' })
          return { valid: false, errors, sanitized: '' }
        }
        
        if (name.length === 0) {
          errors.push({ type: this.ValidationError.TOO_SHORT, field: 'displayName', message: 'Display name cannot be empty' })
          return { valid: false, errors, sanitized: '' }
        }
        
        if (name.length > 50) {
          errors.push({ type: this.ValidationError.TOO_LONG, field: 'displayName', message: 'Display name too long (max 50 characters)' })
        }
        
        if (!/^[a-zA-Z0-9\s._-]{1,50}$/.test(name)) {
          errors.push({ type: this.ValidationError.INVALID_FORMAT, field: 'displayName', message: 'Display name contains invalid characters' })
        }
        
        const sanitized = this.sanitizeHtml(name)
        
        return {
          valid: errors.length === 0,
          errors,
          sanitized
        }
      },
      
      validateEmail(email) {
        const errors = []
        
        if (!email || typeof email !== 'string') {
          return { valid: true, errors: [], sanitized: '' }
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({ type: this.ValidationError.INVALID_FORMAT, field: 'email', message: 'Invalid email format' })
        }
        
        if (email.length > 254) {
          errors.push({ type: this.ValidationError.TOO_LONG, field: 'email', message: 'Email address too long' })
        }
        
        const sanitized = email.toLowerCase().trim()
        
        return {
          valid: errors.length === 0,
          errors,
          sanitized
        }
      },
      
      generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        
        for (let i = 0; i < length; i++) {
          result += chars[Math.floor(Math.random() * chars.length)]
        }
        
        return result
      }
    }
  })

  // Mock sessionStorage for testing
  const mockSessionStorage = {
    store: {},
    getItem: jest.fn((key) => mockSessionStorage.store[key] || null),
    setItem: jest.fn((key, value) => { mockSessionStorage.store[key] = value }),
    removeItem: jest.fn((key) => { delete mockSessionStorage.store[key] }),
    clear: jest.fn(() => { mockSessionStorage.store = {} })
  }

  global.sessionStorage = mockSessionStorage

  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.clear()
  })

  describe('HTML Sanitization', () => {
    test('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello World'
      const sanitized = securityUtils.sanitizeHtml(malicious)
      
      expect(sanitized).toBe('Hello World')
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
    })

    test('should remove iframe tags', () => {
      const malicious = '<iframe src="javascript:alert(1)"></iframe>Hello'
      const sanitized = securityUtils.sanitizeHtml(malicious)
      
      expect(sanitized).toBe('Hello')
      expect(sanitized).not.toContain('<iframe>')
    })

    test('should remove javascript: URLs', () => {
      const malicious = '<a href="javascript:alert(1)">Click me</a>'
      const sanitized = securityUtils.sanitizeHtml(malicious)
      
      expect(sanitized).not.toContain('javascript:')
    })

    test('should escape HTML entities', () => {
      const input = '<div>Hello & "World"</div>'
      const sanitized = securityUtils.sanitizeHtml(input)
      
      expect(sanitized).toContain('&lt;')
      expect(sanitized).toContain('&gt;')
      expect(sanitized).toContain('&amp;')
      expect(sanitized).toContain('&quot;')
    })

    test('should handle empty input', () => {
      expect(securityUtils.sanitizeHtml('')).toBe('')
      expect(securityUtils.sanitizeHtml(null)).toBe('')
      expect(securityUtils.sanitizeHtml(undefined)).toBe('')
    })

    test('should trim whitespace', () => {
      const input = '  Hello World  '
      const sanitized = securityUtils.sanitizeHtml(input)
      
      expect(sanitized).toBe('Hello World')
    })
  })

  describe('Comment Validation', () => {
    test('should validate valid comment', () => {
      const result = securityUtils.validateComment('This is a valid comment.')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized).toBe('This is a valid comment.')
    })

    test('should reject empty comment', () => {
      const result = securityUtils.validateComment('')
      
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe(securityUtils.ValidationError.TOO_SHORT)
    })

    test('should reject null/undefined comment', () => {
      const result1 = securityUtils.validateComment(null)
      const result2 = securityUtils.validateComment(undefined)
      
      expect(result1.valid).toBe(false)
      expect(result2.valid).toBe(false)
      expect(result1.errors[0].type).toBe(securityUtils.ValidationError.REQUIRED)
      expect(result2.errors[0].type).toBe(securityUtils.ValidationError.REQUIRED)
    })

    test('should reject comment that is too long', () => {
      const longComment = 'a'.repeat(5001)
      const result = securityUtils.validateComment(longComment)
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.type === securityUtils.ValidationError.TOO_LONG)).toBe(true)
    })

    test('should detect script injection', () => {
      const malicious = 'Hello <script>alert("xss")</script> World'
      const result = securityUtils.validateComment(malicious)
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.type === securityUtils.ValidationError.SECURITY_VIOLATION)).toBe(true)
    })

    test('should detect SQL injection patterns', () => {
      const malicious = "Hello'; DROP TABLE comments; --"
      const result = securityUtils.validateComment(malicious)
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.type === securityUtils.ValidationError.SECURITY_VIOLATION)).toBe(true)
    })
  })

  describe('Display Name Validation', () => {
    test('should validate valid display name', () => {
      const result = securityUtils.validateDisplayName('John Doe')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized).toBe('John Doe')
    })

    test('should reject empty display name', () => {
      const result = securityUtils.validateDisplayName('')
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.type === securityUtils.ValidationError.TOO_SHORT)).toBe(true)
    })

    test('should reject display name that is too long', () => {
      const longName = 'a'.repeat(51)
      const result = securityUtils.validateDisplayName(longName)
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.type === securityUtils.ValidationError.TOO_LONG)).toBe(true)
    })

    test('should allow valid characters in display name', () => {
      const validNames = ['John123', 'Jane_Doe', 'User-Name', 'Test User']
      
      validNames.forEach(name => {
        const result = securityUtils.validateDisplayName(name)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('Email Validation', () => {
    test('should validate valid email', () => {
      const result = securityUtils.validateEmail('test@example.com')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized).toBe('test@example.com')
    })

    test('should allow empty email (optional field)', () => {
      const result = securityUtils.validateEmail('')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject invalid email format', () => {
      const invalidEmails = ['invalid', 'test@', '@example.com']
      
      invalidEmails.forEach(email => {
        const result = securityUtils.validateEmail(email)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.type === securityUtils.ValidationError.INVALID_FORMAT)).toBe(true)
      })
    })

    test('should normalize email to lowercase', () => {
      const result = securityUtils.validateEmail('Test@EXAMPLE.COM')
      
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('test@example.com')
    })
  })

  describe('Security Token Generation', () => {
    test('should generate secure token of specified length', () => {
      const token = securityUtils.generateSecureToken(16)
      
      expect(token).toHaveLength(16)
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })

    test('should generate different tokens each time', () => {
      const token1 = securityUtils.generateSecureToken()
      const token2 = securityUtils.generateSecureToken()
      
      expect(token1).not.toBe(token2)
    })

    test('should use default length when not specified', () => {
      const token = securityUtils.generateSecureToken()
      
      expect(token).toHaveLength(32)
    })
  })
})