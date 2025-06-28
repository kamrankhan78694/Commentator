/**
 * Jest setup file for Commentator tests
 * This file configures the testing environment and global test utilities
 */

// Mock Firebase for testing
global.mockFirebase = {
  initializeApp: jest.fn(),
  getDatabase: jest.fn(),
  getAuth: jest.fn(),
  ref: jest.fn(),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  push: jest.fn(() => Promise.resolve({ key: 'mock-key' })),
  onValue: jest.fn(),
  off: jest.fn(),
  serverTimestamp: jest.fn(() => ({ '.sv': 'timestamp' })),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'mock-uid' } })),
  onAuthStateChanged: jest.fn()
}

// Mock IPFS/Web3.Storage for testing
global.mockIPFS = {
  upload: jest.fn(() => Promise.resolve('QmMockHash123')),
  retrieve: jest.fn(() => Promise.resolve({ content: 'mock content' }))
}

// Mock DOM elements commonly used in tests
global.mockElement = (tagName = 'div', attributes = {}) => {
  const element = document.createElement(tagName)
  Object.keys(attributes).forEach(key => {
    element.setAttribute(key, attributes[key])
  })
  return element
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

// Setup cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
  document.body.innerHTML = ''
})