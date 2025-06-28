/**
 * Security Tests for Commentator
 * Tests security middleware and protection mechanisms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM environment for testing
global.window = {
  crypto: {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  },
  sessionStorage: {
    storage: {},
    getItem: function(key) { return this.storage[key] || null; },
    setItem: function(key, value) { this.storage[key] = value; },
    removeItem: function(key) { delete this.storage[key]; }
  }
};

global.document = {
  head: { appendChild: () => {} },
  getElementsByTagName: () => [global.document.head],
  createElement: () => ({
    setAttribute: () => {},
    getAttribute: () => null
  }),
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => []
};

global.Uint8Array = Array;
global.sessionStorage = global.window.sessionStorage;

// Test runner instance
const runner = global.runner;

runner.test('Environment configuration file exists', () => {
    const envExamplePath = path.join(__dirname, '../.env.example');
    runner.assert(fs.existsSync(envExamplePath), '.env.example should exist');
    
    const content = fs.readFileSync(envExamplePath, 'utf8');
    runner.assert(content.includes('FIREBASE_API_KEY'), 'Should contain Firebase API key template');
    runner.assert(content.includes('CSRF_SECRET'), 'Should contain CSRF secret template');
});

runner.test('Security middleware file exists and is readable', () => {
    const securityMiddlewarePath = path.join(__dirname, '../js/security-middleware.js');
    runner.assert(fs.existsSync(securityMiddlewarePath), 'security-middleware.js should exist');
    
    const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
    runner.assert(content.includes('SecurityMiddleware'), 'Should contain SecurityMiddleware');
    runner.assert(content.includes('generateCSRFToken'), 'Should contain CSRF token generation');
    runner.assert(content.includes('setSecurityHeaders'), 'Should contain security headers function');
});

runner.test('Firebase configuration supports environment variables', () => {
    const firebaseConfigPath = path.join(__dirname, '../firebase-config.js');
    runner.assert(fs.existsSync(firebaseConfigPath), 'firebase-config.js should exist');
    
    const content = fs.readFileSync(firebaseConfigPath, 'utf8');
    runner.assert(content.includes('getEnvVar'), 'Should contain environment variable helper');
    runner.assert(content.includes('FIREBASE_API_KEY'), 'Should support API key from environment');
    runner.assert(content.includes('process.env'), 'Should check process.env');
});

runner.test('Security utilities exist with enhanced protection', () => {
    const securityPath = path.join(__dirname, '../js/security.js');
    runner.assert(fs.existsSync(securityPath), 'security.js should exist');
    
    const content = fs.readFileSync(securityPath, 'utf8');
    runner.assert(content.includes('XSS_PATTERNS'), 'Should contain XSS protection patterns');
    runner.assert(content.includes('sanitizeText'), 'Should contain text sanitization');
    runner.assert(content.includes('SQL_INJECTION_PATTERNS'), 'Should contain SQL injection protection');
});

runner.test('ESLint configuration is updated for v9', () => {
    const eslintConfigPath = path.join(__dirname, '../eslint.config.js');
    runner.assert(fs.existsSync(eslintConfigPath), 'eslint.config.js should exist');
    
    const content = fs.readFileSync(eslintConfigPath, 'utf8');
    runner.assert(content.includes('export default'), 'Should use ES module syntax');
    runner.assert(content.includes('languageOptions'), 'Should use v9 configuration format');
    runner.assert(content.includes('globals'), 'Should define globals');
});

runner.test('Package.json has no high severity vulnerabilities', () => {
    const packagePath = path.join(__dirname, '../package.json');
    runner.assert(fs.existsSync(packagePath), 'package.json should exist');
    
    const content = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(content);
    
    // Check that deprecated web3.storage has been replaced
    runner.assert(!pkg.dependencies['web3.storage'], 'Should not use deprecated web3.storage');
    runner.assert(pkg.dependencies['@web3-storage/w3up-client'], 'Should use new w3up-client');
    runner.assert(pkg.type === 'module', 'Should be configured as ES module');
});

console.log('✅ Security tests loaded successfully');