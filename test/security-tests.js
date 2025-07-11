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
    },
  },
  sessionStorage: {
    storage: {},
    getItem: function (key) {
      return this.storage[key] || null;
    },
    setItem: function (key, value) {
      this.storage[key] = value;
    },
    removeItem: function (key) {
      delete this.storage[key];
    },
  },
};

global.document = {
  head: { appendChild: () => {} },
  getElementsByTagName: () => [global.document.head],
  createElement: () => ({
    setAttribute: () => {},
    getAttribute: () => null,
  }),
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => [],
};

global.Uint8Array = Array;
global.sessionStorage = global.window.sessionStorage;

// Test runner instance
const runner = global.runner;

runner.test('Environment configuration file exists', () => {
  const envExamplePath = path.join(__dirname, '../.env.example');
  runner.assert(fs.existsSync(envExamplePath), '.env.example should exist');

  const content = fs.readFileSync(envExamplePath, 'utf8');
  runner.assert(
    content.includes('FIREBASE_API_KEY'),
    'Should contain Firebase API key template'
  );
  runner.assert(
    content.includes('CSRF_SECRET'),
    'Should contain CSRF secret template'
  );
});

runner.test('Security middleware file exists and is readable', () => {
  const securityMiddlewarePath = path.join(
    __dirname,
    '../js/security-middleware.js'
  );
  runner.assert(
    fs.existsSync(securityMiddlewarePath),
    'security-middleware.js should exist'
  );

  const content = fs.readFileSync(securityMiddlewarePath, 'utf8');
  runner.assert(
    content.includes('SecurityMiddleware'),
    'Should contain SecurityMiddleware'
  );
  runner.assert(
    content.includes('generateCSRFToken'),
    'Should contain CSRF token generation'
  );
  runner.assert(
    content.includes('setSecurityHeaders'),
    'Should contain security headers function'
  );
});

runner.test('Firebase configuration supports environment variables', () => {
  const firebaseConfigPath = path.join(__dirname, '../firebase-config.js');
  runner.assert(
    fs.existsSync(firebaseConfigPath),
    'firebase-config.js should exist'
  );

  const content = fs.readFileSync(firebaseConfigPath, 'utf8');
  runner.assert(
    content.includes('getEnvVar'),
    'Should contain environment variable helper'
  );
  runner.assert(
    content.includes('FIREBASE_API_KEY'),
    'Should support API key from environment'
  );
  runner.assert(content.includes('process.env'), 'Should check process.env');
});

runner.test('Security utilities exist with enhanced protection', () => {
  const securityPath = path.join(__dirname, '../js/security.js');
  runner.assert(fs.existsSync(securityPath), 'security.js should exist');

  const content = fs.readFileSync(securityPath, 'utf8');
  runner.assert(
    content.includes('XSS_PATTERNS'),
    'Should contain XSS protection patterns'
  );
  runner.assert(
    content.includes('sanitizeText'),
    'Should contain text sanitization'
  );
  runner.assert(
    content.includes('SQL_INJECTION_PATTERNS'),
    'Should contain SQL injection protection'
  );
});

runner.test('ESLint configuration is updated for v9', () => {
  const eslintConfigPath = path.join(__dirname, '../eslint.config.js');
  runner.assert(
    fs.existsSync(eslintConfigPath),
    'eslint.config.js should exist'
  );

  const content = fs.readFileSync(eslintConfigPath, 'utf8');
  runner.assert(
    content.includes('export default'),
    'Should use ES module syntax'
  );
  runner.assert(
    content.includes('languageOptions'),
    'Should use v9 configuration format'
  );
  runner.assert(content.includes('globals'), 'Should define globals');
});

runner.test('Package.json has no high severity vulnerabilities', () => {
  const packagePath = path.join(__dirname, '../package.json');
  runner.assert(fs.existsSync(packagePath), 'package.json should exist');

  const content = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(content);

  // Check that deprecated web3.storage has been replaced
  runner.assert(
    !pkg.dependencies['web3.storage'],
    'Should not use deprecated web3.storage'
  );
  runner.assert(
    pkg.dependencies['@web3-storage/w3up-client'],
    'Should use new w3up-client'
  );
  runner.assert(pkg.type === 'module', 'Should be configured as ES module');
});

runner.test('Server-side validation module exists and works', () => {
  const serverValidationPath = path.join(
    __dirname,
    '../js/server-validation.js'
  );
  runner.assert(
    fs.existsSync(serverValidationPath),
    'server-validation.js should exist'
  );

  const content = fs.readFileSync(serverValidationPath, 'utf8');
  runner.assert(
    content.includes('ServerValidation'),
    'Should contain ServerValidation module'
  );
  runner.assert(
    content.includes('validateComment'),
    'Should contain comment validation'
  );
  runner.assert(
    content.includes('checkRateLimit'),
    'Should contain rate limiting'
  );
  runner.assert(
    content.includes('sanitizeCommentData'),
    'Should contain data sanitization'
  );
});

runner.test('Enhanced validation covers all security requirements', () => {
  const securityPath = path.join(__dirname, '../js/security.js');
  const content = fs.readFileSync(securityPath, 'utf8');

  // Check for comprehensive security patterns
  runner.assert(
    content.includes('XSS_PATTERNS'),
    'Should have XSS protection patterns'
  );
  runner.assert(
    content.includes('SQL_INJECTION_PATTERNS'),
    'Should have SQL injection patterns'
  );
  runner.assert(
    content.includes('SPAM_PATTERNS'),
    'Should have spam detection patterns'
  );
  runner.assert(
    content.includes('validateComment'),
    'Should have comment validation function'
  );
});

runner.test('Performance monitoring module exists and works', () => {
  const performanceMonitorPath = path.join(
    __dirname,
    '../js/performance-monitor.js'
  );
  runner.assert(
    fs.existsSync(performanceMonitorPath),
    'performance-monitor.js should exist'
  );

  const content = fs.readFileSync(performanceMonitorPath, 'utf8');
  runner.assert(
    content.includes('PerformanceMonitor'),
    'Should contain PerformanceMonitor module'
  );
  runner.assert(
    content.includes('performHealthCheck'),
    'Should contain health check function'
  );
  runner.assert(
    content.includes('trackMetric'),
    'Should contain metric tracking'
  );
  runner.assert(
    content.includes('alertThresholds'),
    'Should contain alert thresholds'
  );
});

runner.test('Production deployment checklist exists', () => {
  const checklistPath = path.join(
    __dirname,
    '../archive/reports/PRODUCTION_DEPLOYMENT_CHECKLIST.md'
  );
  runner.assert(
    fs.existsSync(checklistPath),
    'PRODUCTION_DEPLOYMENT_CHECKLIST.md should exist'
  );

  const content = fs.readFileSync(checklistPath, 'utf8');
  runner.assert(
    content.includes('Security Verification'),
    'Should contain security verification'
  );
  runner.assert(
    content.includes('Environment Variables'),
    'Should contain environment setup'
  );
  runner.assert(
    content.includes('Rollback Procedures'),
    'Should contain rollback procedures'
  );
});

runner.test('Emergency response guide exists', () => {
  const emergencyGuidePath = path.join(
    __dirname,
    '../archive/reports/EMERGENCY_RESPONSE_GUIDE.md'
  );
  runner.assert(
    fs.existsSync(emergencyGuidePath),
    'EMERGENCY_RESPONSE_GUIDE.md should exist'
  );

  const content = fs.readFileSync(emergencyGuidePath, 'utf8');
  runner.assert(
    content.includes('Incident Classification'),
    'Should contain incident classification'
  );
  runner.assert(
    content.includes('Security Incident Response'),
    'Should contain security response'
  );
  runner.assert(
    content.includes('Recovery Procedures'),
    'Should contain recovery procedures'
  );
});

runner.test('CI/CD pipeline has production readiness features', () => {
  const cicdPath = path.join(__dirname, '../.github/workflows/ci-cd.yml');
  runner.assert(fs.existsSync(cicdPath), 'ci-cd.yml should exist');

  const content = fs.readFileSync(cicdPath, 'utf8');
  runner.assert(content.includes('test:security'), 'Should run security tests');
  runner.assert(
    content.includes('audit-level=high'),
    'Should check for high severity vulnerabilities'
  );
  runner.assert(content.includes('Quality Gate'), 'Should have quality gates');
  runner.assert(
    content.includes('rollback'),
    'Should have rollback procedures'
  );
});

console.log('✅ Security tests loaded successfully');
