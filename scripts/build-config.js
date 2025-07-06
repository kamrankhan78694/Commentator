/**
 * Build script to inject environment variables into the application
 * Runs during build process to replace placeholders with actual values
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv for environment variables
try {
  // First load default .env file
  if (fs.existsSync(path.join(__dirname, '../.env'))) {
    const dotenvResult = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    dotenvResult.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  }
  
  // Load .env.local file for development
  const envLocalPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    
    envLocalContent.split('\n').forEach(line => {
      if (line.startsWith('#') || !line.includes('=')) return;
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    console.log('📄 Loaded .env.local file');
  }
} catch (error) {
  console.log('Error loading environment files:', error.message);
}

class ConfigBuilder {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.outputPath = path.join(__dirname, '../config/runtime-config.js');
    
    console.log(`🔧 Building configuration for ${this.environment} environment`);
  }

  generateConfig() {
    const config = {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      firebase: {
        apiKey: this.getEnvVar('FIREBASE_API_KEY'),
        authDomain: this.getEnvVar('FIREBASE_AUTH_DOMAIN'),
        databaseURL: this.getEnvVar('FIREBASE_DATABASE_URL'),
        projectId: this.getEnvVar('FIREBASE_PROJECT_ID'),
        storageBucket: this.getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: this.getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: this.getEnvVar('FIREBASE_APP_ID'),
        measurementId: this.getEnvVar('FIREBASE_MEASUREMENT_ID')
      },
      api: {
        baseUrl: this.getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
        version: this.getEnvVar('API_VERSION', 'v1')
      },
      security: {
        encryptionKey: this.getEnvVar('ENCRYPTION_KEY'),
        jwtSecret: this.getEnvVar('JWT_SECRET')
      },
      features: {
        analytics: this.getBoolEnvVar('ENABLE_ANALYTICS', false),
        debug: this.getBoolEnvVar('ENABLE_DEBUG_MODE', this.environment !== 'production'),
        web3: this.getBoolEnvVar('ENABLE_WEB3_FEATURES', false),
        realTimeComments: this.getBoolEnvVar('ENABLE_REAL_TIME_COMMENTS', true),
        performanceMonitoring: this.getBoolEnvVar('ENABLE_PERFORMANCE_MONITORING', false)
      },
      cors: {
        allowedOrigins: this.getArrayEnvVar('ALLOWED_ORIGINS', ['http://localhost:3000']),
        rateLimitPerMinute: parseInt(this.getEnvVar('RATE_LIMIT_REQUESTS_PER_MINUTE', '60'))
      },
      logging: {
        level: this.getEnvVar('LOG_LEVEL', 'info'),
        enableConsole: this.getBoolEnvVar('ENABLE_CONSOLE_LOGGING', true),
        enableRemote: this.getBoolEnvVar('ENABLE_REMOTE_LOGGING', false)
      }
    };

    return this.generateConfigFile(config);
  }

  getEnvVar(name, defaultValue = '') {
    return process.env[name] || defaultValue;
  }

  getBoolEnvVar(name, defaultValue = false) {
    const value = process.env[name];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  getArrayEnvVar(name, defaultValue = []) {
    const value = process.env[name];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim());
  }

  generateConfigFile(config) {
    // Remove sensitive data for client-side config
    const clientConfig = { ...config };
    delete clientConfig.security; // Don't expose secrets to client

    const configContent = `/**
 * Runtime Configuration
 * Generated at build time - DO NOT EDIT MANUALLY
 * Generated: ${config.timestamp}
 * Environment: ${config.environment}
 */

window.COMMENTATOR_RUNTIME_CONFIG = ${JSON.stringify(clientConfig, null, 2)};

// Make available globally
window.RUNTIME_CONFIG = window.COMMENTATOR_RUNTIME_CONFIG;

// Export for module usage
export default window.COMMENTATOR_RUNTIME_CONFIG;

console.log('📦 Runtime configuration loaded for ${config.environment} environment');
`;

    // Ensure directory exists
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, configContent);
    console.log(`✅ Configuration generated for ${this.environment} environment`);
    console.log(`📍 Config file: ${this.outputPath}`);
    
    return config;
  }

  validateConfig() {
    const requiredVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID'
    ];

    const missing = requiredVars.filter(key => !process.env[key] || process.env[key].includes('your-'));
    
    if (missing.length > 0 && this.environment === 'production') {
      console.error('❌ Missing required environment variables for production:', missing);
      console.error('🔧 Please set these variables in your deployment environment');
      process.exit(1);
    }

    if (missing.length > 0) {
      console.warn('⚠️  Missing environment variables (using defaults):', missing);
    } else {
      console.log('✅ All required environment variables are set');
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

const builder = new ConfigBuilder();

switch (command) {
  case 'validate':
    builder.validateConfig();
    break;
  case 'build':
  default:
    builder.validateConfig();
    builder.generateConfig();
    break;
}

export default ConfigBuilder;
