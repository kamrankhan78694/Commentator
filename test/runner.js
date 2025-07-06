/**
 * Test Runner for Commentator
 * Simple Node.js based test runner for basic validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, testFn) {
    this.tests.push({ description, testFn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  async run() {
    console.log('🧪 Running Commentator Tests...\n');

    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(`✅ ${test.description}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.description}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.tests.length}`);

    if (this.failed > 0) {
      console.log('\n🚨 Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
    }
  }
}

// Load and run all test files
async function runAllTests() {
  const testDir = __dirname;
  const testFiles = fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith('-tests.js') && file !== 'runner.js');

  for (const testFile of testFiles) {
    console.log(`\n📁 Running ${testFile}...`);
    try {
      await import(path.join(testDir, testFile));
    } catch (error) {
      console.error(`❌ Failed to load ${testFile}:`, error.message);
      process.exit(1);
    }
  }
}

// Export for use in test files
global.TestRunner = TestRunner;
global.runner = new TestRunner();

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      global.runner.run();
    })
    .catch(console.error);
}

export default TestRunner;
