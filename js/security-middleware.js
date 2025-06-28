/**
 * Security Middleware for Commentator
 * Provides CSRF protection and security headers
 */

window.SecurityMiddleware = (function() {
  'use strict';

  // Generate a secure random token
  function generateCSRFToken() {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for older browsers
      return Math.random().toString(36).substring(2, 15) +
             Math.random().toString(36).substring(2, 15) +
             Date.now().toString(36);
    }
  }

  // Store CSRF token in sessionStorage
  function getCSRFToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = generateCSRFToken();
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  }

  // Add CSRF token to form data
  function addCSRFToken(formData) {
    const token = getCSRFToken();
    if (formData instanceof FormData) {
      formData.append('csrf_token', token);
    } else if (typeof formData === 'object') {
      formData.csrf_token = token;
    }
    return formData;
  }

  // Validate CSRF token
  function validateCSRFToken(submittedToken) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken && submittedToken && storedToken === submittedToken;
  }

  // Set security headers (for client-side enforcement)
  function setSecurityHeaders() {
    // Add meta tags for security headers (these should ideally be set server-side)
    const head = document.head || document.getElementsByTagName('head')[0];

    // Content Security Policy
    const csp = document.createElement('meta');
    csp.setAttribute('http-equiv', 'Content-Security-Policy');
    csp.setAttribute('content',
      'default-src \'self\' https:; ' +
      'script-src \'self\' \'unsafe-inline\' https://www.gstatic.com https://cdn.jsdelivr.net; ' +
      'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; ' +
      'img-src \'self\' data: https:; ' +
      'connect-src \'self\' https: wss:; ' +
      'font-src \'self\' https://fonts.gstatic.com; ' +
      'frame-ancestors \'none\';'
    );
    head.appendChild(csp);

    // X-Frame-Options
    const xFrame = document.createElement('meta');
    xFrame.setAttribute('http-equiv', 'X-Frame-Options');
    xFrame.setAttribute('content', 'DENY');
    head.appendChild(xFrame);

    // X-Content-Type-Options
    const xContentType = document.createElement('meta');
    xContentType.setAttribute('http-equiv', 'X-Content-Type-Options');
    xContentType.setAttribute('content', 'nosniff');
    head.appendChild(xContentType);

    // Referrer Policy
    const referrer = document.createElement('meta');
    referrer.setAttribute('name', 'referrer');
    referrer.setAttribute('content', 'strict-origin-when-cross-origin');
    head.appendChild(referrer);
  }

  // Rate limiting for client-side protection
  const rateLimiter = {
    requests: new Map(),

    isAllowed(endpoint, maxRequests = 10, windowMs = 60000) {
      const now = Date.now();
      const key = `${endpoint}_${Math.floor(now / windowMs)}`;

      const count = this.requests.get(key) || 0;
      this.requests.set(key, count + 1);

      // Clean old entries
      for (const [reqKey] of this.requests) {
        if (reqKey.split('_')[1] < Math.floor(now / windowMs) - 1) {
          this.requests.delete(reqKey);
        }
      }

      return count < maxRequests;
    }
  };

  // Secure request wrapper
  function secureRequest(url, options = {}) {
    // Check rate limiting
    if (!rateLimiter.isAllowed(url)) {
      return Promise.reject(new Error('Rate limit exceeded'));
    }

    // Add CSRF token to requests
    if (options.method && options.method !== 'GET') {
      if (options.body instanceof FormData) {
        addCSRFToken(options.body);
      } else if (options.body && typeof options.body === 'string') {
        try {
          const data = JSON.parse(options.body);
          data.csrf_token = getCSRFToken();
          options.body = JSON.stringify(data);
        } catch (e) {
          // Not JSON, skip CSRF token addition
        }
      }
    }

    // Set secure headers
    options.headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': getCSRFToken(),
      ...options.headers
    };

    return fetch(url, options);
  }

  // Initialize security middleware
  function init() {
    setSecurityHeaders();

    // Add CSRF token to all forms
    document.addEventListener('DOMContentLoaded', () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = getCSRFToken();
        form.appendChild(csrfInput);
      });
    });

    // Log security initialization
    if (window.CommentatorLogger) {
      window.CommentatorLogger.info('Security middleware initialized', 'SECURITY');
    }
  }

  // Public API
  return {
    init,
    getCSRFToken,
    validateCSRFToken,
    addCSRFToken,
    secureRequest,
    rateLimiter
  };
})();

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.SecurityMiddleware.init);
} else {
  window.SecurityMiddleware.init();
}

if (window.CommentatorLogger) {
  window.CommentatorLogger.info('Security middleware loaded', 'SECURITY');
}
