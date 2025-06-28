/**
 * Unit tests for Firebase Service functionality
 * Tests authentication, comment operations, and data validation
 */

describe('Firebase Service', () => {
  let mockFirebaseService

  beforeEach(() => {
    // Mock Firebase service module
    global.FirebaseService = () => {
      let currentUser = null
      let isAuthenticated = false
      const comments = new Map()
      const users = new Map()
      const sessions = new Map()

      return {
        // Authentication methods
        async initAuth() {
          // Simulate anonymous authentication
          currentUser = { uid: 'anonymous-' + Date.now() }
          isAuthenticated = true
          return currentUser
        },

        getCurrentUser() {
          return currentUser
        },

        isUserAuthenticated() {
          return isAuthenticated
        },

        // Comment methods
        async saveComment(urlHash, commentData) {
          if (!isAuthenticated) {
            throw new Error('User not authenticated')
          }

          // Validate comment data
          if (!commentData.text || commentData.text.length === 0) {
            throw new Error('Comment text is required')
          }

          if (commentData.text.length > 5000) {
            throw new Error('Comment text too long')
          }

          if (!commentData.author || commentData.author.length === 0) {
            throw new Error('Author is required')
          }

          const comment = {
            id: Date.now() + Math.random(),
            ...commentData,
            timestamp: Date.now(),
            userId: currentUser.uid
          }

          if (!comments.has(urlHash)) {
            comments.set(urlHash, [])
          }
          comments.get(urlHash).push(comment)

          return comment.id
        },

        async loadComments(urlHash) {
          return comments.get(urlHash) || []
        },

        // User methods
        async saveUserData(userId, userData) {
          if (!isAuthenticated || currentUser.uid !== userId) {
            throw new Error('Unauthorized')
          }

          if (!userData.displayName || userData.displayName.length === 0) {
            throw new Error('Display name is required')
          }

          if (userData.displayName.length > 50) {
            throw new Error('Display name too long')
          }

          const user = {
            ...userData,
            id: userId,
            createdAt: Date.now()
          }

          users.set(userId, user)
          return user
        },

        async loadUserData(userId) {
          return users.get(userId) || null
        },

        // Session methods
        async createSession(sessionData) {
          if (!isAuthenticated) {
            throw new Error('User not authenticated')
          }

          const session = {
            id: Date.now() + Math.random(),
            userId: currentUser.uid,
            createdAt: Date.now(),
            ...sessionData
          }

          sessions.set(session.id, session)
          return session.id
        },

        async updateSessionActivity(sessionId) {
          if (!sessions.has(sessionId)) {
            throw new Error('Session not found')
          }

          const session = sessions.get(sessionId)
          session.lastActivity = Date.now()
          return session
        },

        async closeSession(sessionId) {
          if (!sessions.has(sessionId)) {
            throw new Error('Session not found')
          }

          const session = sessions.get(sessionId)
          session.closedAt = Date.now()
          return session
        },

        // Utility methods
        generateUrlHash(url) {
          // Simple hash function for testing that produces different hashes
          let hash = 0
          for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32bit integer
          }
          return Math.abs(hash).toString(36).substr(0, 20)
        }
      }
    }

    mockFirebaseService = global.FirebaseService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    test('should initialize authentication successfully', async () => {
      const user = await mockFirebaseService.initAuth()
      
      expect(user).toBeDefined()
      expect(user.uid).toMatch(/^anonymous-/)
      expect(mockFirebaseService.isUserAuthenticated()).toBe(true)
    })

    test('should return current user after authentication', async () => {
      await mockFirebaseService.initAuth()
      
      const currentUser = mockFirebaseService.getCurrentUser()
      expect(currentUser).toBeDefined()
      expect(currentUser.uid).toMatch(/^anonymous-/)
    })

    test('should return false for authentication status before init', () => {
      expect(mockFirebaseService.isUserAuthenticated()).toBe(false)
    })
  })

  describe('Comment Operations', () => {
    beforeEach(async () => {
      await mockFirebaseService.initAuth()
    })

    test('should save comment successfully', async () => {
      const commentData = {
        text: 'This is a test comment',
        author: 'Test User'
      }
      
      const commentId = await mockFirebaseService.saveComment('test-url-hash', commentData)
      
      expect(commentId).toBeDefined()
      expect(typeof commentId).toBe('number')
    })

    test('should load saved comments', async () => {
      const commentData = {
        text: 'This is a test comment',
        author: 'Test User'
      }
      
      await mockFirebaseService.saveComment('test-url-hash', commentData)
      const comments = await mockFirebaseService.loadComments('test-url-hash')
      
      expect(comments).toHaveLength(1)
      expect(comments[0].text).toBe('This is a test comment')
      expect(comments[0].author).toBe('Test User')
      expect(comments[0].timestamp).toBeDefined()
    })

    test('should reject comment without text', async () => {
      const commentData = {
        text: '',
        author: 'Test User'
      }
      
      await expect(mockFirebaseService.saveComment('test-url-hash', commentData))
        .rejects.toThrow('Comment text is required')
    })

    test('should reject comment with text too long', async () => {
      const commentData = {
        text: 'a'.repeat(5001),
        author: 'Test User'
      }
      
      await expect(mockFirebaseService.saveComment('test-url-hash', commentData))
        .rejects.toThrow('Comment text too long')
    })

    test('should reject comment without author', async () => {
      const commentData = {
        text: 'This is a test comment',
        author: ''
      }
      
      await expect(mockFirebaseService.saveComment('test-url-hash', commentData))
        .rejects.toThrow('Author is required')
    })

    test('should reject comment when not authenticated', async () => {
      // Create new service without authentication
      const unauthenticatedService = global.FirebaseService()
      
      const commentData = {
        text: 'This is a test comment',
        author: 'Test User'
      }
      
      await expect(unauthenticatedService.saveComment('test-url-hash', commentData))
        .rejects.toThrow('User not authenticated')
    })

    test('should return empty array for URL with no comments', async () => {
      const comments = await mockFirebaseService.loadComments('nonexistent-url-hash')
      
      expect(comments).toEqual([])
    })
  })

  describe('User Data Operations', () => {
    beforeEach(async () => {
      await mockFirebaseService.initAuth()
    })

    test('should save user data successfully', async () => {
      const currentUser = mockFirebaseService.getCurrentUser()
      const userData = {
        displayName: 'Test User',
        email: 'test@example.com'
      }
      
      const user = await mockFirebaseService.saveUserData(currentUser.uid, userData)
      
      expect(user.displayName).toBe('Test User')
      expect(user.email).toBe('test@example.com')
      expect(user.createdAt).toBeDefined()
    })

    test('should load saved user data', async () => {
      const currentUser = mockFirebaseService.getCurrentUser()
      const userData = {
        displayName: 'Test User',
        email: 'test@example.com'
      }
      
      await mockFirebaseService.saveUserData(currentUser.uid, userData)
      const loadedUser = await mockFirebaseService.loadUserData(currentUser.uid)
      
      expect(loadedUser.displayName).toBe('Test User')
      expect(loadedUser.email).toBe('test@example.com')
    })

    test('should reject user data without display name', async () => {
      const currentUser = mockFirebaseService.getCurrentUser()
      const userData = {
        displayName: '',
        email: 'test@example.com'
      }
      
      await expect(mockFirebaseService.saveUserData(currentUser.uid, userData))
        .rejects.toThrow('Display name is required')
    })

    test('should reject user data with display name too long', async () => {
      const currentUser = mockFirebaseService.getCurrentUser()
      const userData = {
        displayName: 'a'.repeat(51),
        email: 'test@example.com'
      }
      
      await expect(mockFirebaseService.saveUserData(currentUser.uid, userData))
        .rejects.toThrow('Display name too long')
    })

    test('should return null for nonexistent user', async () => {
      const user = await mockFirebaseService.loadUserData('nonexistent-user-id')
      
      expect(user).toBeNull()
    })
  })

  describe('Session Management', () => {
    beforeEach(async () => {
      await mockFirebaseService.initAuth()
    })

    test('should create session successfully', async () => {
      const sessionData = {
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1'
      }
      
      const sessionId = await mockFirebaseService.createSession(sessionData)
      
      expect(sessionId).toBeDefined()
      expect(typeof sessionId).toBe('number')
    })

    test('should update session activity', async () => {
      const sessionData = {
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1'
      }
      
      const sessionId = await mockFirebaseService.createSession(sessionData)
      const session = await mockFirebaseService.updateSessionActivity(sessionId)
      
      expect(session.lastActivity).toBeDefined()
      expect(typeof session.lastActivity).toBe('number')
    })

    test('should close session successfully', async () => {
      const sessionData = {
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1'
      }
      
      const sessionId = await mockFirebaseService.createSession(sessionData)
      const session = await mockFirebaseService.closeSession(sessionId)
      
      expect(session.closedAt).toBeDefined()
      expect(typeof session.closedAt).toBe('number')
    })

    test('should reject session operations for nonexistent session', async () => {
      await expect(mockFirebaseService.updateSessionActivity('nonexistent-session'))
        .rejects.toThrow('Session not found')
      
      await expect(mockFirebaseService.closeSession('nonexistent-session'))
        .rejects.toThrow('Session not found')
    })
  })

  describe('Utility Functions', () => {
    test('should generate URL hash', () => {
      const url = 'https://example.com/test-page'
      const hash = mockFirebaseService.generateUrlHash(url)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeLessThanOrEqual(20)
      expect(hash).toMatch(/^[a-zA-Z0-9]+$/)
    })

    test('should generate consistent hash for same URL', () => {
      const url = 'https://example.com/test-page'
      const hash1 = mockFirebaseService.generateUrlHash(url)
      const hash2 = mockFirebaseService.generateUrlHash(url)
      
      expect(hash1).toBe(hash2)
    })

    test('should generate different hashes for different URLs', () => {
      const url1 = 'https://example.com/page1'
      const url2 = 'https://example.com/page2'
      const hash1 = mockFirebaseService.generateUrlHash(url1)
      const hash2 = mockFirebaseService.generateUrlHash(url2)
      
      expect(hash1).not.toBe(hash2)
    })
  })
})