/**
 * Environment Configuration for Commentator
 * Handles different environments (development, staging, production)
 */

class EnvironmentConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfig();
    this.logEnvironment();
  }

  detectEnvironment() {
    // Check for environment indicators
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev') || hostname.includes('test')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  loadConfig() {
    // For browser environments, prefer the runtime config if available
    if (typeof window !== 'undefined' && window.COMMENTATOR_RUNTIME_CONFIG) {
      const runtimeConfig = window.COMMENTATOR_RUNTIME_CONFIG;
      return {
        firebase: runtimeConfig.firebase,
        apiUrl: runtimeConfig.api.baseUrl,
        debug: runtimeConfig.features.debug,
        enableAnalytics: runtimeConfig.features.analytics,
        enableEmulators: this.environment === 'development',
        features: runtimeConfig.features
      };
    }

    // Fallback configurations (used when runtime config is not available)
    const configs = {
      development: {
        firebase: {
          apiKey: "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk",
          authDomain: "commentator78694.firebaseapp.com",
          databaseURL: "https://commentator78694-default-rtdb.europe-west1.firebasedatabase.app",
          projectId: "commentator78694",
          storageBucket: "commentator78694.firebasestorage.app",
          messagingSenderId: "318788278941",
          appId: "1:318788278941:web:c47dca1e572e3f767f9274"
        },
        apiUrl: 'http://localhost:3000/api',
        debug: true,
        enableAnalytics: false,
        enableEmulators: true,
        features: {
          realTimeComments: true,
          debugLogger: true,
          performanceMonitoring: false
        }
      },
      
      staging: {
        firebase: {
          apiKey: this.getEnvVar('FIREBASE_API_KEY_STAGING', 'your-staging-api-key'),
          authDomain: this.getEnvVar('FIREBASE_AUTH_DOMAIN_STAGING', 'commentator-staging.firebaseapp.com'),
          databaseURL: this.getEnvVar('FIREBASE_DATABASE_URL_STAGING', 'https://commentator-staging-default-rtdb.firebaseio.com'),
          projectId: this.getEnvVar('FIREBASE_PROJECT_ID_STAGING', 'commentator-staging'),
          storageBucket: this.getEnvVar('FIREBASE_STORAGE_BUCKET_STAGING', 'commentator-staging.appspot.com'),
          messagingSenderId: this.getEnvVar('FIREBASE_MESSAGING_SENDER_ID_STAGING', 'staging-sender-id'),
          appId: this.getEnvVar('FIREBASE_APP_ID_STAGING', 'staging-app-id')
        },
        apiUrl: 'https://api-staging.commentator.app',
        debug: true,
        enableAnalytics: false,
        enableEmulators: false,
        features: {
          realTimeComments: true,
          debugLogger: true,
          performanceMonitoring: true
        }
      },
      
      production: {
        firebase: {
          apiKey: this.getEnvVar('FIREBASE_API_KEY', 'your-production-api-key'),
          authDomain: this.getEnvVar('FIREBASE_AUTH_DOMAIN', 'commentator-prod.firebaseapp.com'),
          databaseURL: this.getEnvVar('FIREBASE_DATABASE_URL', 'https://commentator-prod-default-rtdb.firebaseio.com'),
          projectId: this.getEnvVar('FIREBASE_PROJECT_ID', 'commentator-prod'),
          storageBucket: this.getEnvVar('FIREBASE_STORAGE_BUCKET', 'commentator-prod.appspot.com'),
          messagingSenderId: this.getEnvVar('FIREBASE_MESSAGING_SENDER_ID', 'prod-sender-id'),
          appId: this.getEnvVar('FIREBASE_APP_ID', 'prod-app-id')
        },
        apiUrl: 'https://api.commentator.app',
        debug: false,
        enableAnalytics: true,
        enableEmulators: false,
        features: {
          realTimeComments: true,
          debugLogger: false,
          performanceMonitoring: true
        }
      }
    };

    return configs[this.environment] || configs.development;
  }

  getEnvVar(name, defaultValue) {
    // Try different methods to get environment variables
    // Note: process.env is not available in browser, only in Node.js
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Browser environment - use window-based configs
      return window?.ENV?.[name] || 
             this.getMetaEnvVar(name) || 
             defaultValue;
    }
    
    // Node.js environment - use process.env
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || defaultValue;
    }
    
    return defaultValue;
  }

  getMetaEnvVar(name) {
    // Check for environment variables in meta tags
    const metaTag = document.querySelector(`meta[name="env-${name.toLowerCase()}"]`);
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  logEnvironment() {
    const style = this.environment === 'production' ? 
      'color: #28a745; font-weight: bold;' : 
      'color: #007bff; font-weight: bold;';
    
    console.log(`%c🌍 Commentator Environment: ${this.environment.toUpperCase()}`, style);
    
    if (this.config.debug) {
      console.log('🔧 Debug mode enabled');
      console.log('📊 Configuration:', {
        environment: this.environment,
        apiUrl: this.config.apiUrl,
        features: this.config.features,
        firebaseProject: this.config.firebase.projectId
      });
    }
  }

  getFirebaseConfig() {
    return this.config.firebase;
  }

  getApiUrl() {
    return this.config.apiUrl;
  }

  isDebugMode() {
    return this.config.debug;
  }

  isAnalyticsEnabled() {
    return this.config.enableAnalytics;
  }

  areEmulatorsEnabled() {
    return this.config.enableEmulators;
  }

  getEnvironment() {
    return this.environment;
  }

  getFeatures() {
    return this.config.features;
  }

  isFeatureEnabled(featureName) {
    return this.config.features[featureName] || false;
  }

  validateConfiguration() {
    const requiredFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
    const config = this.getFirebaseConfig();
    const missingFields = requiredFields.filter(field => 
      !config[field] || config[field].includes('your-')
    );
    
    if (missingFields.length > 0) {
      const message = `Missing Firebase configuration: ${missingFields.join(', ')}`;
      console.error('❌ Configuration Error:', message);
      
      if (this.environment === 'production') {
        throw new Error(`Production deployment blocked: ${message}`);
      } else {
        console.warn('⚠️  Using default development configuration');
      }
      
      return false;
    }
    
    console.log('✅ Firebase configuration validated');
    return true;
  }
}

// Create global instance
const environmentConfig = new EnvironmentConfig();

// Make it globally available
window.EnvironmentConfig = environmentConfig;
window.ENV_CONFIG = environmentConfig; // Alternative access

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnvironmentConfig;
}

// Export as ES module
if (typeof exports !== 'undefined') {
  exports.default = EnvironmentConfig;
}
