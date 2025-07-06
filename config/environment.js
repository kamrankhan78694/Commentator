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
    const configs = {
      development: {
        firebase: {
          apiKey: "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk",
          authDomain: "commentator78694.firebaseapp.com",
          databaseURL: "https://commentator78694-default-rtdb.firebaseio.com",
          projectId: "commentator78694",
          storageBucket: "commentator78694.appspot.com",
          messagingSenderId: "123456789012",
          appId: "1:123456789012:web:abcdef123456"
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

    return configs[this.environment];
  }

  getEnvVar(name, defaultValue) {
    // Try different methods to get environment variables
    return process?.env?.[name] || 
           window?.ENV?.[name] || 
           this.getMetaEnvVar(name) || 
           defaultValue;
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
