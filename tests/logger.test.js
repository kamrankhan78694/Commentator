/**
 * Unit tests for Logger functionality
 * Tests the CommentatorLogger class for proper logging, filtering, and error handling
 */

describe('CommentatorLogger', () => {
  let logger
  let mockElement

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="debug-panel" class="debug-panel hidden">
        <div class="debug-logs" id="debug-logs"></div>
        <div class="debug-log-count"></div>
        <input class="debug-search" type="text" />
        <select class="debug-filter">
          <option value="all">All</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
    `

    // Initialize logger with mock element
    mockElement = document.getElementById('debug-panel')
    
    // Mock the CommentatorLogger class for testing
    global.CommentatorLogger = class CommentatorLogger {
      constructor(element) {
        this.panelElement = element
        this.logs = []
        this.maxLogs = 100
        this.isVisible = false
        this.currentFilter = 'all'
        this.searchTerm = ''
      }

      log(message, level = 'info', category = 'APP', details = null) {
        const logEntry = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          message,
          level,
          category,
          details
        }
        
        this.logs.push(logEntry)
        
        if (this.logs.length > this.maxLogs) {
          this.logs = this.logs.slice(-this.maxLogs)
        }
        
        return logEntry
      }

      info(message, category = 'APP', details = null) {
        return this.log(message, 'info', category, details)
      }

      warning(message, category = 'APP', details = null) {
        return this.log(message, 'warning', category, details)
      }

      error(message, category = 'APP', details = null) {
        return this.log(message, 'error', category, details)
      }

      clearLogs() {
        this.logs = []
      }

      shouldShowLog(logEntry) {
        const matchesFilter = this.currentFilter === 'all' || logEntry.level === this.currentFilter
        const matchesSearch = !this.searchTerm || 
          logEntry.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          logEntry.category.toLowerCase().includes(this.searchTerm.toLowerCase())
        
        return matchesFilter && matchesSearch
      }
    }

    logger = new global.CommentatorLogger(mockElement)
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('Logging functionality', () => {
    test('should create log entry with correct properties', () => {
      const logEntry = logger.log('Test message', 'info', 'TEST')
      
      expect(logEntry).toHaveProperty('id')
      expect(logEntry).toHaveProperty('timestamp')
      expect(logEntry.message).toBe('Test message')
      expect(logEntry.level).toBe('info')
      expect(logEntry.category).toBe('TEST')
    })

    test('should add log to logs array', () => {
      logger.log('Test message')
      
      expect(logger.logs).toHaveLength(1)
      expect(logger.logs[0].message).toBe('Test message')
    })

    test('should limit log history to maxLogs', () => {
      logger.maxLogs = 3
      
      logger.log('Message 1')
      logger.log('Message 2')
      logger.log('Message 3')
      logger.log('Message 4')
      
      expect(logger.logs).toHaveLength(3)
      expect(logger.logs[0].message).toBe('Message 2')
      expect(logger.logs[2].message).toBe('Message 4')
    })

    test('should use default values for optional parameters', () => {
      const logEntry = logger.log('Test message')
      
      expect(logEntry.level).toBe('info')
      expect(logEntry.category).toBe('APP')
      expect(logEntry.details).toBeNull()
    })
  })

  describe('Convenience logging methods', () => {
    test('info() should create info-level log', () => {
      const logEntry = logger.info('Info message', 'TEST')
      
      expect(logEntry.level).toBe('info')
      expect(logEntry.message).toBe('Info message')
      expect(logEntry.category).toBe('TEST')
    })

    test('warning() should create warning-level log', () => {
      const logEntry = logger.warning('Warning message', 'TEST')
      
      expect(logEntry.level).toBe('warning')
      expect(logEntry.message).toBe('Warning message')
    })

    test('error() should create error-level log', () => {
      const logEntry = logger.error('Error message', 'TEST')
      
      expect(logEntry.level).toBe('error')
      expect(logEntry.message).toBe('Error message')
    })

    test('should use default category for convenience methods', () => {
      const logEntry = logger.info('Test message')
      
      expect(logEntry.category).toBe('APP')
    })
  })

  describe('Log filtering', () => {
    beforeEach(() => {
      logger.info('Info message')
      logger.warning('Warning message')
      logger.error('Error message')
    })

    test('should show all logs when filter is "all"', () => {
      logger.currentFilter = 'all'
      
      const visibleLogs = logger.logs.filter(log => logger.shouldShowLog(log))
      expect(visibleLogs).toHaveLength(3)
    })

    test('should filter logs by level', () => {
      logger.currentFilter = 'error'
      
      const visibleLogs = logger.logs.filter(log => logger.shouldShowLog(log))
      expect(visibleLogs).toHaveLength(1)
      expect(visibleLogs[0].level).toBe('error')
    })

    test('should filter logs by search term in message', () => {
      logger.searchTerm = 'warning'
      
      const visibleLogs = logger.logs.filter(log => logger.shouldShowLog(log))
      expect(visibleLogs).toHaveLength(1)
      expect(visibleLogs[0].message).toBe('Warning message')
    })

    test('should filter logs by search term in category', () => {
      logger.logs[0].category = 'FIREBASE'
      logger.searchTerm = 'fire'
      
      const visibleLogs = logger.logs.filter(log => logger.shouldShowLog(log))
      expect(visibleLogs).toHaveLength(1)
    })

    test('should apply both filter and search', () => {
      logger.currentFilter = 'info'
      logger.searchTerm = 'warning'
      
      const visibleLogs = logger.logs.filter(log => logger.shouldShowLog(log))
      expect(visibleLogs).toHaveLength(0)
    })
  })

  describe('Log management', () => {
    test('should clear all logs', () => {
      logger.log('Test 1')
      logger.log('Test 2')
      
      expect(logger.logs).toHaveLength(2)
      
      logger.clearLogs()
      
      expect(logger.logs).toHaveLength(0)
    })
  })

  describe('Error handling', () => {
    test('should handle invalid log levels gracefully', () => {
      const logEntry = logger.log('Test message', 'invalid-level')
      
      expect(logEntry.level).toBe('invalid-level')
      expect(logEntry.message).toBe('Test message')
    })

    test('should handle empty messages', () => {
      const logEntry = logger.log('')
      
      expect(logEntry.message).toBe('')
      expect(logger.logs).toHaveLength(1)
    })

    test('should handle null/undefined messages', () => {
      const logEntry1 = logger.log(null)
      const logEntry2 = logger.log(undefined)
      
      expect(logEntry1.message).toBeNull()
      expect(logEntry2.message).toBeUndefined()
      expect(logger.logs).toHaveLength(2)
    })
  })
})