/**
 * Unit Tests for Commentator Core Functions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM environment for testing
global.window = {
  location: {
    hostname: 'localhost',
    pathname: '/test',
  },
};

global.document = {
  getElementById: () => null,
  createElement: () => ({
    addEventListener: () => {},
    innerHTML: '',
    textContent: '',
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
  }),
  addEventListener: () => {},
  body: {
    appendChild: () => {},
  },
  head: {
    appendChild: () => {},
  },
};

// Mock fetch for testing
global.fetch = () =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<div>Mock content</div>'),
  });

// Load main.js content for testing
const mainJsPath = path.join(__dirname, '../js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// Extract and evaluate only the functions we need to test
try {
  // Extract getBaseUrl function specifically
  const getBaseUrlMatch = mainJsContent.match(
    /function getBaseUrl\(\) \{[\s\S]*?\n\}/
  );
  if (getBaseUrlMatch) {
    eval(getBaseUrlMatch[0]);
  }
} catch (error) {
  console.warn(
    'Could not extract functions from main.js for testing:',
    error.message
  );
  // Create a mock function for testing
  global.getBaseUrl = () => './';
}

// Unit Tests
runner.test('getBaseUrl function exists in main.js', () => {
  const mainJsPath = path.join(__dirname, '../js/main.js');
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

  runner.assert(
    mainJsContent.includes('function getBaseUrl()'),
    'main.js should contain getBaseUrl function'
  );

  // Extract and evaluate the function for testing
  const getBaseUrlMatch = mainJsContent.match(
    /function getBaseUrl\(\) \{[\s\S]*?\n\}/
  );
  runner.assert(
    getBaseUrlMatch,
    'Should be able to extract getBaseUrl function'
  );
});

runner.test('Firebase configuration supports GitHub Pages deployment', () => {
  const mainJsPath = path.join(__dirname, '../js/main.js');
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

  // Check for GitHub Pages handling
  runner.assert(
    mainJsContent.includes('github.io'),
    'Should handle GitHub Pages URLs'
  );
  runner.assert(
    mainJsContent.includes('location.hostname'),
    'Should check hostname for deployment'
  );
});

runner.test('Firebase service file exists and is readable', () => {
  const firebaseServicePath = path.join(__dirname, '../js/firebase-service.js');
  runner.assert(
    fs.existsSync(firebaseServicePath),
    'firebase-service.js should exist'
  );

  const content = fs.readFileSync(firebaseServicePath, 'utf8');
  runner.assert(
    content.includes('FirebaseService'),
    'Should contain FirebaseService'
  );
  runner.assert(
    content.includes('saveComment'),
    'Should contain saveComment function'
  );
  runner.assert(
    content.includes('loadComments'),
    'Should contain loadComments function'
  );
});

runner.test('Logger service file exists and is readable', () => {
  const loggerPath = path.join(__dirname, '../js/logger.js');
  runner.assert(fs.existsSync(loggerPath), 'logger.js should exist');

  const content = fs.readFileSync(loggerPath, 'utf8');
  runner.assert(
    content.includes('CommentatorLogger'),
    'Should contain CommentatorLogger class'
  );
  runner.assert(content.includes('log'), 'Should contain log method');
});

runner.test('IPFS service file exists and is readable', () => {
  const ipfsPath = path.join(__dirname, '../js/ipfs.js');
  runner.assert(fs.existsSync(ipfsPath), 'ipfs.js should exist');

  const content = fs.readFileSync(ipfsPath, 'utf8');
  runner.assert(
    content.includes('IPFSIntegration'),
    'Should contain IPFSIntegration'
  );
});

runner.test('HTML files exist and are valid', () => {
  const htmlFiles = ['index.html', 'archive/tests/automated_test.html', 'archive/tests/debug_test.html'];

  htmlFiles.forEach((file) => {
    const filePath = path.join(__dirname, '../', file);
    runner.assert(fs.existsSync(filePath), `${file} should exist`);

    const content = fs.readFileSync(filePath, 'utf8');
    runner.assert(
      content.includes('<!DOCTYPE html>'),
      `${file} should have DOCTYPE`
    );
    runner.assert(content.includes('<html'), `${file} should have html tag`);
  });
});

runner.test('CSS files exist and are accessible', () => {
  const cssDir = path.join(__dirname, '../css');
  runner.assert(fs.existsSync(cssDir), 'CSS directory should exist');

  const cssFiles = fs
    .readdirSync(cssDir)
    .filter((file) => file.endsWith('.css'));
  runner.assert(cssFiles.length > 0, 'Should have at least one CSS file');
});

runner.test('Firebase configuration exists', () => {
  const firebaseConfigPath = path.join(__dirname, '../firebase-config.js');
  runner.assert(
    fs.existsSync(firebaseConfigPath),
    'firebase-config.js should exist'
  );

  const content = fs.readFileSync(firebaseConfigPath, 'utf8');
  runner.assert(
    content.includes('firebaseConfig'),
    'Should contain firebaseConfig object'
  );
});

runner.test('Database rules are properly configured', () => {
  const rulesPath = path.join(__dirname, '../database.rules.json');
  runner.assert(fs.existsSync(rulesPath), 'database.rules.json should exist');

  const content = fs.readFileSync(rulesPath, 'utf8');
  const rules = JSON.parse(content);

  runner.assert(rules.rules, 'Should have rules object');
  runner.assert(rules.rules.comments, 'Should have comments rules');
  runner.assert(rules.rules.users, 'Should have users rules');
  runner.assert(rules.rules.sessions, 'Should have sessions rules');
});

console.log('✅ Unit tests loaded successfully');
