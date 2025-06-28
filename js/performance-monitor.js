/**
 * Performance Monitoring and Health Checks for Commentator
 * Provides real-time monitoring, alerting, and performance tracking
 */

window.PerformanceMonitor = (function() {
  'use strict';

  // Configuration
  const CONFIG = {
    healthCheckInterval: 30000, // 30 seconds
    performanceThresholds: {
      pageLoadTime: 3000, // 3 seconds
      apiResponseTime: 1000, // 1 second
      memoryUsagePercent: 80 // 80%
    },
    alertThresholds: {
      errorRate: 5, // 5% error rate
      responseTime: 2000, // 2 seconds
      memoryUsage: 90 // 90%
    }
  };

  // Metrics storage
  const metrics = {
    pageViews: 0,
    commentSubmissions: 0,
    errors: [],
    responseTime: [],
    memoryUsage: [],
    uptime: Date.now(),
    lastHealthCheck: Date.now()
  };

  // Health check status
  let healthStatus = {
    overall: 'healthy',
    services: {
      frontend: 'healthy',
      firebase: 'unknown',
      storage: 'healthy'
    },
    lastCheck: Date.now()
  };

  /**
   * Initialize performance monitoring
   */
  function init() {
    // Track page performance
    trackPagePerformance();

    // Start health checks
    startHealthChecks();

    // Monitor user interactions
    monitorUserInteractions();

    // Monitor memory usage
    monitorMemoryUsage();

    // Set up error tracking
    setupErrorTracking();

    log('Performance monitoring initialized');
  }

  /**
   * Track page load performance
   */
  function trackPagePerformance() {
    if (!performance || !performance.timing) return;

    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      trackMetric('page_load_time', loadTime);

      if (loadTime > CONFIG.performanceThresholds.pageLoadTime) {
        alert('warning', `Slow page load detected: ${loadTime}ms`);
      }

      // Track other performance metrics
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      const firstByte = timing.responseStart - timing.navigationStart;

      trackMetric('dom_content_loaded', domContentLoaded);
      trackMetric('time_to_first_byte', firstByte);
    });
  }

  /**
   * Start periodic health checks
   */
  function startHealthChecks() {
    performHealthCheck();
    setInterval(performHealthCheck, CONFIG.healthCheckInterval);
  }

  /**
   * Perform comprehensive health check
   */
  async function performHealthCheck() {
    const startTime = Date.now();
    const newHealthStatus = {
      overall: 'healthy',
      services: {
        frontend: 'healthy',
        firebase: 'unknown',
        storage: 'healthy'
      },
      lastCheck: startTime,
      metrics: {
        responseTime: 0,
        memoryUsage: getMemoryUsage(),
        errorRate: calculateErrorRate(),
        uptime: startTime - metrics.uptime
      }
    };

    try {
      // Check frontend health
      await checkFrontendHealth(newHealthStatus);

      // Check Firebase connectivity
      await checkFirebaseHealth(newHealthStatus);

      // Check local storage
      checkStorageHealth(newHealthStatus);

      // Calculate overall health
      const unhealthyServices = Object.values(newHealthStatus.services)
        .filter(status => status !== 'healthy').length;

      if (unhealthyServices === 0) {
        newHealthStatus.overall = 'healthy';
      } else if (unhealthyServices <= 1) {
        newHealthStatus.overall = 'degraded';
      } else {
        newHealthStatus.overall = 'unhealthy';
      }

    } catch (error) {
      newHealthStatus.overall = 'unhealthy';
      log('Health check failed: ' + error.message, 'error');
    }

    const responseTime = Date.now() - startTime;
    newHealthStatus.metrics.responseTime = responseTime;

    healthStatus = newHealthStatus;
    metrics.lastHealthCheck = Date.now();

    // Alert on health issues
    if (newHealthStatus.overall !== 'healthy') {
      alert('error', `System health degraded: ${newHealthStatus.overall}`);
    }

    // Log health status
    log(`Health check completed: ${newHealthStatus.overall} (${responseTime}ms)`);

    return newHealthStatus;
  }

  /**
   * Check frontend health
   */
  async function checkFrontendHealth(healthStatus) {
    try {
      // Check if DOM is accessible
      if (!document || !document.body) {
        healthStatus.services.frontend = 'unhealthy';
        return;
      }

      // Check if essential functions are available
      if (!window.SecurityUtils || !window.SecurityMiddleware) {
        healthStatus.services.frontend = 'degraded';
        return;
      }

      healthStatus.services.frontend = 'healthy';
    } catch (error) {
      healthStatus.services.frontend = 'unhealthy';
      throw error;
    }
  }

  /**
   * Check Firebase connectivity
   */
  async function checkFirebaseHealth(healthStatus) {
    try {
      if (!window.FirebaseService) {
        healthStatus.services.firebase = 'unknown';
        return;
      }

      // Simple connectivity test (would be implemented based on actual Firebase service)
      const testStart = Date.now();

      // Mock Firebase health check
      await new Promise(resolve => setTimeout(resolve, 100));

      const responseTime = Date.now() - testStart;

      if (responseTime > CONFIG.alertThresholds.responseTime) {
        healthStatus.services.firebase = 'degraded';
      } else {
        healthStatus.services.firebase = 'healthy';
      }

    } catch (error) {
      healthStatus.services.firebase = 'unhealthy';
      throw error;
    }
  }

  /**
   * Check storage health
   */
  function checkStorageHealth(healthStatus) {
    try {
      // Test localStorage
      const testKey = 'health_check_test';
      const testValue = Date.now().toString();

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        healthStatus.services.storage = 'unhealthy';
        return;
      }

      // Test sessionStorage
      sessionStorage.setItem(testKey, testValue);
      const sessionRetrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);

      if (sessionRetrieved !== testValue) {
        healthStatus.services.storage = 'degraded';
        return;
      }

      healthStatus.services.storage = 'healthy';
    } catch (error) {
      healthStatus.services.storage = 'unhealthy';
      throw error;
    }
  }

  /**
   * Monitor user interactions
   */
  function monitorUserInteractions() {
    // Track page views
    metrics.pageViews++;
    trackMetric('page_view', 1);

    // Track comment submissions
    document.addEventListener('submit', (event) => {
      if (event.target.classList.contains('comment-form')) {
        metrics.commentSubmissions++;
        trackMetric('comment_submission', 1);
      }
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      trackMetric('user_click', 1);
    });
  }

  /**
   * Monitor memory usage
   */
  function monitorMemoryUsage() {
    if (!performance || !performance.memory) return;

    setInterval(() => {
      const memInfo = getMemoryUsage();
      if (memInfo) {
        const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;

        trackMetric('memory_usage_percent', usagePercent);

        if (usagePercent > CONFIG.alertThresholds.memoryUsage) {
          alert('warning', `High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Get memory usage information
   */
  function getMemoryUsage() {
    if (performance && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  /**
   * Setup error tracking
   */
  function setupErrorTracking() {
    window.addEventListener('error', (event) => {
      trackError({
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      trackError({
        message: 'Unhandled Promise Rejection: ' + event.reason,
        timestamp: Date.now(),
        type: 'promise_rejection'
      });
    });
  }

  /**
   * Track error occurrence
   */
  function trackError(error) {
    metrics.errors.push(error);

    // Keep only recent errors (last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    metrics.errors = metrics.errors.filter(err => err.timestamp > oneHourAgo);

    trackMetric('error_count', 1);

    const errorRate = calculateErrorRate();
    if (errorRate > CONFIG.alertThresholds.errorRate) {
      alert('error', `High error rate detected: ${errorRate.toFixed(1)}%`);
    }
  }

  /**
   * Calculate current error rate
   */
  function calculateErrorRate() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentErrors = metrics.errors.filter(err => err.timestamp > oneHourAgo);
    const totalInteractions = metrics.pageViews + metrics.commentSubmissions;

    return totalInteractions > 0 ? (recentErrors.length / totalInteractions) * 100 : 0;
  }

  /**
   * Track a metric
   */
  function trackMetric(name, value) {
    const metric = {
      name,
      value,
      timestamp: Date.now()
    };

    // Store in appropriate array
    if (name.includes('time')) {
      metrics.responseTime.push(metric);
      // Keep only recent metrics (last hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      metrics.responseTime = metrics.responseTime.filter(m => m.timestamp > oneHourAgo);
    }

    // Log to analytics service (when available)
    log(`Metric: ${name} = ${value}`, 'info');
  }

  /**
   * Send alert
   */
  function alert(level, message) {
    const alertData = {
      level,
      message,
      timestamp: Date.now(),
      metrics: healthStatus.metrics
    };

    log(`Alert [${level.toUpperCase()}]: ${message}`, level);

    // In production, this would send to alerting service
    if (window.CommentatorLogger) {
      window.CommentatorLogger.log(level, message, alertData);
    }
  }

  /**
   * Get current health status
   */
  function getHealthStatus() {
    return { ...healthStatus };
  }

  /**
   * Get performance metrics
   */
  function getMetrics() {
    return { ...metrics };
  }

  /**
   * Generate performance report
   */
  function generateReport() {
    const memUsage = getMemoryUsage();
    const errorRate = calculateErrorRate();

    return {
      timestamp: Date.now(),
      uptime: Date.now() - metrics.uptime,
      health: healthStatus,
      metrics: {
        pageViews: metrics.pageViews,
        commentSubmissions: metrics.commentSubmissions,
        errorCount: metrics.errors.length,
        errorRate: errorRate,
        memoryUsage: memUsage,
        lastHealthCheck: metrics.lastHealthCheck
      }
    };
  }

  /**
   * Log message
   */
  function log(message, level = 'info') {
    if (window.CommentatorLogger) {
      window.CommentatorLogger.log(level, message, 'PERFORMANCE');
    }
  }

  // Public API
  return {
    init,
    performHealthCheck,
    getHealthStatus,
    getMetrics,
    generateReport,
    trackMetric,
    trackError
  };
})();

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.PerformanceMonitor.init);
} else {
  window.PerformanceMonitor.init();
}

if (window.CommentatorLogger) {
  window.CommentatorLogger.info('Performance monitoring loaded', 'PERFORMANCE');
}
