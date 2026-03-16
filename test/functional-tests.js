/**
 * Functional Tests for Commentator Core Logic
 * Tests actual function behavior, not just file existence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up mock DOM and browser globals for security.js IIFE
global.window = global.window || {};
global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = String(value);
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  },
};
global.window.localStorage = global.localStorage;
global.window.CommentatorLogger = null;

// Load and evaluate security.js to get SecurityUtils
const securityJsPath = path.join(__dirname, '../js/security.js');
const securityJsContent = fs.readFileSync(securityJsPath, 'utf8');

// Execute the IIFE to populate window.SecurityUtils
try {
  // The security.js defines window.SecurityUtils as an IIFE
  const wrappedCode = `(function() { ${securityJsContent} })();`;
  eval(wrappedCode);
} catch (e) {
  // Fallback: try to extract just the IIFE
  try {
    eval(securityJsContent);
  } catch (e2) {
    console.warn('Could not load SecurityUtils for testing:', e2.message);
  }
}

const SecurityUtils = global.window.SecurityUtils;

// ============================================
// Security Utils - sanitizeText tests
// ============================================

runner.test('sanitizeText removes script tags', () => {
  runner.assert(SecurityUtils, 'SecurityUtils should be loaded');
  const result = SecurityUtils.sanitizeText('<script>alert("xss")</script>');
  runner.assert(!result.includes('<script'), 'Should remove script tags');
  runner.assert(
    !result.includes('</script'),
    'Should remove closing script tags'
  );
});

runner.test('sanitizeText encodes HTML entities', () => {
  const result = SecurityUtils.sanitizeText('Hello <b>world</b>');
  runner.assert(!result.includes('<b>'), 'Should encode HTML tags');
  runner.assert(
    result.includes('&lt;b&gt;'),
    'Should contain encoded entities'
  );
});

runner.test('sanitizeText handles empty and non-string input', () => {
  runner.assertEqual(
    SecurityUtils.sanitizeText(''),
    '',
    'Empty string should return empty'
  );
  runner.assertEqual(
    SecurityUtils.sanitizeText(null),
    '',
    'Null should return empty'
  );
  runner.assertEqual(
    SecurityUtils.sanitizeText(undefined),
    '',
    'Undefined should return empty'
  );
  runner.assertEqual(
    SecurityUtils.sanitizeText(123),
    '',
    'Number should return empty'
  );
});

runner.test('sanitizeText removes javascript: protocol', () => {
  const result = SecurityUtils.sanitizeText('javascript:alert(1)');
  runner.assert(
    !result.includes('javascript:'),
    'Should remove javascript: protocol'
  );
});

// ============================================
// Security Utils - validateComment tests
// ============================================

runner.test('validateComment rejects empty comments', () => {
  const result = SecurityUtils.validateComment('');
  runner.assert(!result.valid, 'Empty comment should be invalid');
  runner.assert(result.errors.length > 0, 'Should have error messages');
});

runner.test('validateComment rejects too-short comments', () => {
  const result = SecurityUtils.validateComment('ab');
  runner.assert(!result.valid, 'Two-character comment should be invalid');
});

runner.test('validateComment rejects too-long comments', () => {
  const longText = 'a'.repeat(5001);
  const result = SecurityUtils.validateComment(longText);
  runner.assert(!result.valid, 'Comment over 5000 chars should be invalid');
});

runner.test('validateComment accepts valid comments', () => {
  const result = SecurityUtils.validateComment(
    'This is a valid comment about the website.'
  );
  runner.assert(result.valid, 'Normal comment should be valid');
  runner.assertEqual(result.errors.length, 0, 'Should have no errors');
});

runner.test('validateComment detects SQL injection attempts', () => {
  const result = SecurityUtils.validateComment(
    "test'; DROP TABLE comments; --"
  );
  runner.assert(!result.valid, 'SQL injection attempt should be invalid');
  runner.assert(
    result.errors.some((e) => e.includes('invalid characters')),
    'Should flag invalid characters'
  );
});

runner.test('validateComment detects XSS patterns', () => {
  const result = SecurityUtils.validateComment(
    '<script>alert("xss")</script> some text'
  );
  runner.assert(!result.valid, 'Comment with script tag should be invalid');
  runner.assert(
    result.errors.some((e) => e.includes('dangerous')),
    'Should mention dangerous content'
  );
});

// ============================================
// Security Utils - detectSpam tests
// ============================================

runner.test('detectSpam detects excessive repetition', () => {
  const result = SecurityUtils.detectSpam('aaaaaaaaaaaaaaa normal text');
  runner.assert(
    result.isSpam,
    'Excessive repetition should be flagged as spam'
  );
  runner.assert(
    result.reasons.some((r) => r.includes('repetition')),
    'Should mention repetition'
  );
});

runner.test('detectSpam detects too many links', () => {
  const result = SecurityUtils.detectSpam(
    'Check out https://a.com and https://b.com and https://c.com and https://d.com for great deals'
  );
  runner.assert(result.isSpam, 'Too many links should be flagged as spam');
});

runner.test('detectSpam detects spam keywords', () => {
  const result = SecurityUtils.detectSpam(
    'Buy now! Click here for free money!'
  );
  runner.assert(result.isSpam, 'Spam keywords should be flagged');
});

runner.test('detectSpam allows normal content', () => {
  const result = SecurityUtils.detectSpam(
    'This is a thoughtful comment about the article.'
  );
  runner.assert(!result.isSpam, 'Normal content should not be flagged as spam');
});

runner.test('detectSpam detects excessive capitalization', () => {
  const result = SecurityUtils.detectSpam(
    'THIS IS ALL CAPS COMMENT THAT GOES ON AND ON'
  );
  runner.assert(result.isSpam, 'Excessive caps should be flagged as spam');
  runner.assert(
    result.reasons.some((r) => r.includes('capitalization')),
    'Should mention capitalization'
  );
});

// ============================================
// Security Utils - checkRateLimit tests
// ============================================

runner.test('checkRateLimit allows first request', () => {
  global.localStorage.clear();
  const allowed = SecurityUtils.checkRateLimit('test_action', 5, 60000);
  runner.assert(allowed, 'First request should be allowed');
});

runner.test('checkRateLimit blocks after exceeding limit', () => {
  global.localStorage.clear();
  const key = 'test_rate_limit';

  // Make 5 requests (the limit)
  for (let i = 0; i < 5; i++) {
    SecurityUtils.checkRateLimit(key, 5, 60000);
  }

  // 6th request should be blocked
  const blocked = SecurityUtils.checkRateLimit(key, 5, 60000);
  runner.assert(!blocked, 'Request exceeding rate limit should be blocked');
});

// ============================================
// Comment escapeHtml tests (from comments.js)
// ============================================

runner.test('Comment module has escapeHtml for XSS prevention', () => {
  const commentsPath = path.join(__dirname, '../js/comments.js');
  const content = fs.readFileSync(commentsPath, 'utf8');

  runner.assert(
    content.includes('function escapeHtml'),
    'comments.js should have escapeHtml function'
  );
  runner.assert(
    content.includes('&amp;'),
    'escapeHtml should encode ampersands'
  );
  runner.assert(content.includes('&lt;'), 'escapeHtml should encode less-than');
  runner.assert(
    content.includes('&gt;'),
    'escapeHtml should encode greater-than'
  );
});

// ============================================
// Comment submission integrates security
// ============================================

runner.test('Comment submission integrates SecurityUtils validation', () => {
  const commentsPath = path.join(__dirname, '../js/comments.js');
  const content = fs.readFileSync(commentsPath, 'utf8');

  runner.assert(
    content.includes('SecurityUtils.checkRateLimit'),
    'submitComment should check rate limiting'
  );
  runner.assert(
    content.includes('SecurityUtils.validateComment'),
    'submitComment should validate comments'
  );
  runner.assert(
    content.includes('SecurityUtils.detectSpam'),
    'submitComment should detect spam'
  );
  runner.assert(
    content.includes('SecurityUtils.sanitizeText'),
    'submitComment should sanitize text'
  );
});

// ============================================
// Vote buttons exist in comment display
// ============================================

runner.test('Comment display includes interactive vote buttons', () => {
  const displayPath = path.join(__dirname, '../js/comment-display.js');
  const content = fs.readFileSync(displayPath, 'utf8');

  runner.assert(
    content.includes('btn-upvote'),
    'Should have upvote button class'
  );
  runner.assert(
    content.includes('btn-downvote'),
    'Should have downvote button class'
  );
  runner.assert(
    content.includes('vote-count'),
    'Should have vote count display'
  );
});

// ============================================
// Global API functions exist in main.js
// ============================================

runner.test('Main.js exposes all required global functions', () => {
  const mainPath = path.join(__dirname, '../js/main.js');
  const content = fs.readFileSync(mainPath, 'utf8');

  const requiredFunctions = [
    'attachUrl',
    'detachUrl',
    'openAuthModal',
    'closeAuthModal',
    'switchAuthTab',
    'signInWithGoogle',
    'signInAnonymously',
  ];

  requiredFunctions.forEach((fn) => {
    runner.assert(
      content.includes(`window.${fn}`),
      `Should expose window.${fn}`
    );
    runner.assert(
      content.includes(`function ${fn}`),
      `Should define ${fn} function`
    );
  });
});

// ============================================
// Vote handling in comments.js
// ============================================

runner.test('Comments module handles vote actions', () => {
  const commentsPath = path.join(__dirname, '../js/comments.js');
  const content = fs.readFileSync(commentsPath, 'utf8');

  runner.assert(
    content.includes('handleVoteAction'),
    'Should have handleVoteAction function'
  );
  runner.assert(
    content.includes('btn-upvote'),
    'Should handle upvote button clicks'
  );
  runner.assert(
    content.includes('btn-downvote'),
    'Should handle downvote button clicks'
  );
});

console.log('✅ Functional tests loaded successfully');
