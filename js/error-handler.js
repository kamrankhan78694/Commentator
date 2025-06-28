/**
 * Error Handling and Monitoring for Commentator
 * Provides centralized error handling, monitoring, and analytics
 */

window.ErrorHandler = (function() {
  'use strict';

  const config = {
    enableConsoleLogging: true,
    enableRemoteLogging: false, // Set to true when backend is available
    enableUserNotifications: true,
    maxErrorsStored: 100,
    remoteEndpoint: '/api/errors' // Configure when backend is available
  };

  let errors = [];
  const metrics = {
    pageLoadTime: 0,
    commentsLoaded: 0,
    commentsSubmitted: 0,
    errorsCount: 0,
    sessionStartTime: Date.now()
  };

  /**
     * Initialize error handling and monitoring
     */
  function init() {
    // Capture global errors
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Measure page load time
    if (performance && performance.timing) {
      window.addEventListener('load', () => {
        metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log('info', 'Page loaded', { loadTime: metrics.pageLoadTime });
      });
    }

    // Initialize periodic health check
    setInterval(performHealthCheck, 30000); // Every 30 seconds

    log('info', 'Error handling and monitoring initialized');
  }

  /**
     * Handle global JavaScript errors
     * @param {ErrorEvent} event - Error event
     */
  function handleGlobalError(event) {
    const error = {
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logError(error);
  }

  /**
     * Handle unhandled promise rejections
     * @param {PromiseRejectionEvent} event - Promise rejection event
     */
  function handleUnhandledRejection(event) {
    const error = {
      type: 'promise_rejection',
      message: event.reason ? event.reason.toString() : 'Unhandled promise rejection',
      stack: event.reason && event.reason.stack ? event.reason.stack : null,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logError(error);
  }

  /**
     * Log an error with context
     * @param {Object} error - Error object or error details
     * @param {Object} context - Additional context
     */
  function logError(error, context = {}) {
    const errorEntry = {
      id: generateErrorId(),
      timestamp: Date.now(),
      ...error,
      context,
      sessionId: getSessionId()
    };

    // Store error locally
    errors.push(errorEntry);
    if (errors.length > config.maxErrorsStored) {
      errors = errors.slice(-config.maxErrorsStored);
    }

    metrics.errorsCount++;

    // Log to console
    if (config.enableConsoleLogging) {
      console.error('Error logged:', errorEntry);
    }

    // Log to logger if available
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        errorEntry.message,
        'ERROR_HANDLER',
        errorEntry
      );
    }

    // Send to remote logging service (when available)
    if (config.enableRemoteLogging) {
      sendErrorToRemote(errorEntry);
    }

    // Show user notification for critical errors
    if (config.enableUserNotifications && isCriticalError(error)) {
      showUserNotification('An error occurred. Please try again.', 'error');
    }
  }

  /**
     * Log application events and metrics
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
  function log(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
      sessionId: getSessionId()
    };

    if (config.enableConsoleLogging) {
      console[level] ? console[level](message, data) : console.log(message, data);
    }

    if (window.CommentatorLogger) {
      window.CommentatorLogger[level] ?
        window.CommentatorLogger[level](message, 'MONITORING', data) :
        window.CommentatorLogger.info(message, 'MONITORING', data);
    }
  }

  /**
     * Track performance metrics
     * @param {string} metric - Metric name
     * @param {number} value - Metric value
     * @param {Object} tags - Additional tags
     */
  function trackMetric(metric, value, tags = {}) {
    const metricEntry = {
      metric,
      value,
      tags,
      timestamp: Date.now(),
      sessionId: getSessionId()
    };

    metrics[metric] = value;

    log('info', `Metric: ${metric} = ${value}`, metricEntry);

    // Send to analytics service (when available)
    if (config.enableRemoteLogging) {
      sendMetricToRemote(metricEntry);
    }
  }

  /**
     * Perform health check
     */
  function performHealthCheck() {
    const health = {
      timestamp: Date.now(),
      sessionDuration: Date.now() - metrics.sessionStartTime,
      errorsCount: metrics.errorsCount,
      memoryUsage: getMemoryUsage(),
      connectionStatus: navigator.onLine ? 'online' : 'offline',
      localStorageAvailable: isLocalStorageAvailable(),
      sessionStorageAvailable: isSessionStorageAvailable()
    };

    log('info', 'Health check', health);

    // Alert if too many errors
    if (metrics.errorsCount > 10) {
      log('warn', 'High error count detected', { count: metrics.errorsCount });
    }
  }

  /**
     * Get memory usage information
     * @returns {Object} Memory usage stats
     */
  function getMemoryUsage() {
    if (performance && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
     * Check if localStorage is available
     * @returns {boolean}
     */
  function isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
     * Check if sessionStorage is available
     * @returns {boolean}
     */
  function isSessionStorageAvailable() {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
     * Generate unique error ID
     * @returns {string} Error ID
     */
  function generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
     * Get or create session ID
     * @returns {string} Session ID
     */
  function getSessionId() {
    let sessionId = sessionStorage.getItem('commentator_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('commentator_session_id', sessionId);
    }
    return sessionId;
  }

  /**
     * Check if error is critical
     * @param {Object} error - Error object
     * @returns {boolean} True if critical
     */
  function isCriticalError(error) {
    const criticalPatterns = [
      /firebase/i,
      /network/i,
      /authentication/i,
      /security/i,
      /permission/i
    ];

    return criticalPatterns.some(pattern =>
      pattern.test(error.message) || pattern.test(error.type)
    );
  }

  /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, warn, error, success)
     */
  function showUserNotification(message, type = 'info') {
    // Try to use existing notification system
    if (window.CommentatorLogger && window.CommentatorLogger.userNotification) {
      window.CommentatorLogger.userNotification(message, type);
      return;
    }

    // Fallback to simple alert for critical errors
    if (type === 'error') {
      console.error('User notification:', message);
      // Could implement a custom notification UI here
    }
  }

  /**
     * Send error to remote logging service
     * @param {Object} error - Error entry
     */
  function sendErrorToRemote(error) {
    // Implementation for remote error logging
    // This would be implemented when backend service is available
    if (config.remoteEndpoint) {
      fetch(config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      }).catch(err => {
        console.warn('Failed to send error to remote service:', err);
      });
    }
  }

  /**
     * Send metric to remote analytics service
     * @param {Object} metric - Metric entry
     */
  function sendMetricToRemote(metric) {
    // Implementation for remote metrics
    // This would be implemented when analytics service is available
    if (config.remoteEndpoint) {
      const analyticsEndpoint = config.remoteEndpoint.replace('/errors', '/metrics');
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      }).catch(err => {
        console.warn('Failed to send metric to remote service:', err);
      });
    }
  }

  /**
     * Get current metrics
     * @returns {Object} Current metrics
     */
  function getMetrics() {
    return {
      ...metrics,
      sessionDuration: Date.now() - metrics.sessionStartTime,
      currentTime: Date.now()
    };
  }

  /**
     * Get recent errors
     * @param {number} limit - Maximum number of errors to return
     * @returns {Array} Recent errors
     */
  function getRecentErrors(limit = 10) {
    return errors.slice(-limit);
  }

  /**
     * Clear stored errors
     */
  function clearErrors() {
    errors = [];
    metrics.errorsCount = 0;
    log('info', 'Errors cleared');
  }

  // Public API
  return {
    init,
    logError,
    log,
    trackMetric,
    getMetrics,
    getRecentErrors,
    clearErrors,
    showUserNotification
  };
})();

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ErrorHandler.init();
  });
} else {
  window.ErrorHandler.init();
}
