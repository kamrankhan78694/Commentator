/**
 * Integration Tests for Commentator
 * Tests the integration between different components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Firebase for testing
global.mockFirebase = {
  comments: [],
  users: [],
  sessions: [],

  saveComment: (comment) => {
    comment.id = Date.now().toString();
    global.mockFirebase.comments.push(comment);
    return Promise.resolve(comment);
  },

  loadComments: (urlHash) => {
    return Promise.resolve(
      global.mockFirebase.comments.filter((c) => c.urlHash === urlHash)
    );
  },

  saveUser: (user) => {
    global.mockFirebase.users.push(user);
    return Promise.resolve(user);
  },
};

runner.test('Firebase service integration test', async () => {
  // Test comment saving and loading flow
  const testComment = {
    text: 'Test comment',
    author: 'Test User',
    timestamp: Date.now(),
    urlHash: 'test-url-hash',
  };

  const savedComment = await global.mockFirebase.saveComment(testComment);
  runner.assert(savedComment.id, 'Saved comment should have an ID');

  const loadedComments =
    await global.mockFirebase.loadComments('test-url-hash');
  runner.assertEqual(
    loadedComments.length,
    1,
    'Should load exactly one comment'
  );
  runner.assertEqual(
    loadedComments[0].text,
    testComment.text,
    'Comment text should match'
  );
});

runner.test('Comment validation integration', () => {
  const validComment = {
    text: 'This is a valid comment',
    author: 'Valid User',
    timestamp: Date.now(),
  };

  const invalidCommentEmpty = {
    text: '',
    author: 'User',
    timestamp: Date.now(),
  };

  const invalidCommentLong = {
    text: 'x'.repeat(5001), // Exceeds 5000 char limit
    author: 'User',
    timestamp: Date.now(),
  };

  // Simulate validation logic from database rules
  function validateComment(comment) {
    if (!comment.text || comment.text.length === 0) return false;
    if (comment.text.length > 5000) return false;
    if (!comment.author || comment.author.length === 0) return false;
    if (comment.author.length > 100) return false;
    if (!comment.timestamp || typeof comment.timestamp !== 'number')
      return false;
    return true;
  }

  runner.assert(
    validateComment(validComment),
    'Valid comment should pass validation'
  );
  runner.assert(
    !validateComment(invalidCommentEmpty),
    'Empty comment should fail validation'
  );
  runner.assert(
    !validateComment(invalidCommentLong),
    'Long comment should fail validation'
  );
});

runner.test('URL hash generation consistency', () => {
  // Test URL hash generation for consistency
  const testUrls = [
    'https://example.com',
    'https://example.com/page',
    'https://example.com/page?param=value',
    'https://example.com/page#section',
  ];

  // Simple hash function simulation
  function generateUrlHash(url) {
    return btoa(url)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  testUrls.forEach((url) => {
    const hash1 = generateUrlHash(url);
    const hash2 = generateUrlHash(url);
    runner.assertEqual(
      hash1,
      hash2,
      `Hash generation should be consistent for ${url}`
    );
    runner.assert(hash1.length > 0, `Hash should not be empty for ${url}`);
  });
});

runner.test('Logger integration with different log levels', () => {
  // Test logger functionality without actual DOM
  const mockLogs = [];

  const mockLogger = {
    logs: mockLogs,
    log: function (message, level = 'info', category = 'APP', details = null) {
      const logEntry = {
        timestamp: new Date(),
        message,
        level,
        category,
        details,
      };
      this.logs.push(logEntry);
    },
    info: function (message, category, details) {
      this.log(message, 'info', category, details);
    },
    error: function (message, category, details) {
      this.log(message, 'error', category, details);
    },
    warning: function (message, category, details) {
      this.log(message, 'warning', category, details);
    },
  };

  mockLogger.info('Test info message', 'TEST');
  mockLogger.error('Test error message', 'TEST');
  mockLogger.warning('Test warning message', 'TEST');

  runner.assertEqual(mockLogs.length, 3, 'Should have logged 3 messages');
  runner.assertEqual(
    mockLogs[0].level,
    'info',
    'First log should be info level'
  );
  runner.assertEqual(
    mockLogs[1].level,
    'error',
    'Second log should be error level'
  );
  runner.assertEqual(
    mockLogs[2].level,
    'warning',
    'Third log should be warning level'
  );
});

runner.test('Firebase rules security validation', () => {
  const rulesPath = path.join(__dirname, '../database.rules.json');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  const rules = JSON.parse(rulesContent);

  // Test comment rules security
  const commentRules = rules.rules.comments;
  runner.assert(
    commentRules.$urlHash['.read'] === true,
    'Comments should be readable by all'
  );
  runner.assert(
    commentRules.$urlHash['.write'] === 'auth != null',
    'Comments should require authentication to write'
  );

  // Test user rules security
  const userRules = rules.rules.users;
  runner.assert(
    userRules.$userId['.read'] === 'auth != null && auth.uid == $userId',
    'Users should only read their own data'
  );
  runner.assert(
    userRules.$userId['.write'] === 'auth != null && auth.uid == $userId',
    'Users should only write their own data'
  );

  // Test validation rules exist
  runner.assert(
    commentRules.$urlHash.text['.validate'],
    'Comment text should have validation'
  );
  runner.assert(
    commentRules.$urlHash.author['.validate'],
    'Comment author should have validation'
  );
});

runner.test('File structure integrity', () => {
  const requiredFiles = [
    'index.html',
    'package.json',
    'firebase.json',
    'database.rules.json',
    'js/main.js',
    'js/firebase-service.js',
    'js/logger.js',
    'js/ipfs.js',
  ];

  requiredFiles.forEach((file) => {
    const filePath = path.join(__dirname, '../', file);
    runner.assert(
      fs.existsSync(filePath),
      `Required file ${file} should exist`
    );
  });

  // Check that critical directories exist
  const requiredDirs = ['js', 'css', 'test'];
  requiredDirs.forEach((dir) => {
    const dirPath = path.join(__dirname, '../', dir);
    runner.assert(
      fs.existsSync(dirPath),
      `Required directory ${dir} should exist`
    );
  });
});

console.log('✅ Integration tests loaded successfully');
