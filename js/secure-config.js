/**
 * Secure Firebase Configuration
 * Environment-based configuration that hides sensitive data in production
 */

// Environment configuration
const ENV = {
  development: {
    apiKey: 'AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk',
    authDomain: 'commentator78694.firebaseapp.com',
    databaseURL: 'https://commentator78694-default-rtdb.firebaseio.com',
    projectId: 'commentator78694',
    storageBucket: 'commentator78694.firebasestorage.app',
    messagingSenderId: '318788278941',
    appId: '1:318788278941:web:c47dca1e572e3f767f9274'
  },
  production: {
    // Production configuration should be loaded from environment variables
    apiKey: process?.env?.FIREBASE_API_KEY || getConfigFromMeta('firebase-api-key'),
    authDomain: process?.env?.FIREBASE_AUTH_DOMAIN || getConfigFromMeta('firebase-auth-domain'),
    databaseURL: process?.env?.FIREBASE_DATABASE_URL || getConfigFromMeta('firebase-database-url'),
    projectId: process?.env?.FIREBASE_PROJECT_ID || getConfigFromMeta('firebase-project-id'),
    storageBucket: process?.env?.FIREBASE_STORAGE_BUCKET || getConfigFromMeta('firebase-storage-bucket'),
    messagingSenderId: process?.env?.FIREBASE_MESSAGING_SENDER_ID || getConfigFromMeta('firebase-messaging-sender-id'),
    appId: process?.env?.FIREBASE_APP_ID || getConfigFromMeta('firebase-app-id')
  }
}

/**
 * Get configuration from meta tags (for browser environments)
 * This allows sensitive config to be injected at build time
 */
function getConfigFromMeta (name) {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector(`meta[name="${name}"]`)
    return meta ? meta.getAttribute('content') : null
  }
  return null
}

/**
 * Detect current environment
 */
function getCurrentEnvironment () {
  // Check for explicit environment setting
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV
  }

  // Browser environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    // Production domains
    if (hostname === 'commentator78694.web.app' ||
        hostname === 'commentator78694.firebaseapp.com') {
      return 'production'
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development'
    }
  }

  // Default to development
  return 'development'
}

/**
 * Validate configuration completeness
 */
function validateConfig (config) {
  const requiredFields = [
    'apiKey', 'authDomain', 'databaseURL',
    'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ]

  const missingFields = requiredFields.filter(field => !config[field])

  if (missingFields.length > 0) {
    console.error('Firebase configuration incomplete. Missing fields:', missingFields)
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`)
  }

  return true
}

/**
 * Get Firebase configuration for current environment
 */
export function getFirebaseConfig () {
  const environment = getCurrentEnvironment()
  const config = ENV[environment]

  if (!config) {
    throw new Error(`No Firebase configuration found for environment: ${environment}`)
  }

  validateConfig(config)

  // Log environment (but not sensitive config)
  console.info(`Firebase initialized for environment: ${environment}`)

  return config
}

/**
 * Security headers and CSP configuration
 */
export const SECURITY_CONFIG = {
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Needed for Firebase scripts
      'https://www.gstatic.com',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      'https://*.firebaseio.com',
      'https://*.googleapis.com',
      'https://identitytoolkit.googleapis.com',
      'https://web3.storage',
      'https://*.ipfs.io'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:'
    ],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"]
  },

  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  comments: {
    perMinute: 5,
    perHour: 50,
    perDay: 200
  },
  authentication: {
    perMinute: 10,
    perHour: 100
  }
}
