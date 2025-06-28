/**
 * Performance Monitoring and Analytics for Commentator
 * Tracks performance metrics, user interactions, and system health
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
    this.thresholds = {
      commentLoad: 500, // ms
      commentSubmit: 1000, // ms
      pageLoad: 2000, // ms
      apiCall: 3000 // ms
    }
    this.isEnabled = true
    this.init()
  }

  init() {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        this.measurePageLoad()
      })

      // Monitor navigation timing
      this.measureNavigationTiming()
    }

    // Monitor resource loading
    this.monitorResources()

    // Set up periodic health checks
    setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Every 30 seconds
  }

  /**
   * Start measuring a performance metric
   */
  startMeasure(name, category = 'general') {
    if (!this.isEnabled) return

    const key = `${category}.${name}`
    this.startTimes.set(key, performance.now())
  }

  /**
   * End measuring a performance metric
   */
  endMeasure(name, category = 'general') {
    if (!this.isEnabled) return

    const key = `${category}.${name}`
    const startTime = this.startTimes.get(key)

    if (!startTime) {
      console.warn(`No start time found for metric: ${key}`)
      return
    }

    const duration = performance.now() - startTime
    this.recordMetric(key, duration)
    this.startTimes.delete(key)

    // Check if metric exceeds threshold
    this.checkThreshold(name, duration)

    return duration
  }

  /**
   * Record a metric value
   */
  recordMetric(name, value, metadata = {}) {
    if (!this.isEnabled) return

    const timestamp = Date.now()
    const metric = {
      name,
      value,
      timestamp,
      metadata,
      session: this.getSessionId()
    }

    // Store in memory (last 100 metrics)
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metrics = this.metrics.get(name)
    metrics.push(metric)

    // Keep only last 100 metrics per type
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }

    // Send to external monitoring service (if configured)
    this.sendToMonitoringService(metric)
  }

  /**
   * Measure page load performance
   */
  measurePageLoad() {
    if (!window.performance || !window.performance.timing) return

    const timing = window.performance.timing
    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      connection: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      total: timing.loadEventEnd - timing.navigationStart
    }

    Object.entries(metrics).forEach(([key, value]) => {
      this.recordMetric(`pageLoad.${key}`, value)
    })
  }

  /**
   * Measure navigation timing
   */
  measureNavigationTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return

    const navigation = window.performance.getEntriesByType('navigation')[0]
    if (!navigation) return

    this.recordMetric('navigation.domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
    this.recordMetric('navigation.loadEvent', navigation.loadEventEnd - navigation.loadEventStart)
    this.recordMetric('navigation.unload', navigation.unloadEventEnd - navigation.unloadEventStart)
  }

  /**
   * Monitor resource loading
   */
  monitorResources() {
    if (!window.performance || !window.performance.getEntriesByType) return

    // Monitor script and stylesheet loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.recordMetric(`resource.${entry.initiatorType}`, entry.duration, {
            name: entry.name,
            size: entry.transferSize
          })
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['resource'] })
    } catch (e) {
      console.warn('Resource monitoring not supported')
    }
  }

  /**
   * Monitor Firebase operations
   */
  measureFirebaseOperation(operation, promise) {
    if (!this.isEnabled) return promise

    const startTime = performance.now()
    const operationKey = `firebase.${operation}`

    return promise
      .then((result) => {
        const duration = performance.now() - startTime
        this.recordMetric(operationKey, duration, { success: true })
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        this.recordMetric(operationKey, duration, { success: false, error: error.message })
        throw error
      })
  }

  /**
   * Monitor IPFS operations
   */
  measureIPFSOperation(operation, promise) {
    if (!this.isEnabled) return promise

    const startTime = performance.now()
    const operationKey = `ipfs.${operation}`

    return promise
      .then((result) => {
        const duration = performance.now() - startTime
        this.recordMetric(operationKey, duration, { success: true })
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        this.recordMetric(operationKey, duration, { success: false, error: error.message })
        throw error
      })
  }

  /**
   * Check if metric exceeds threshold
   */
  checkThreshold(metricName, value) {
    const threshold = this.thresholds[metricName]
    if (threshold && value > threshold) {
      this.recordMetric('performance.threshold.exceeded', value, {
        metric: metricName,
        threshold,
        severity: this.getThresholdSeverity(value, threshold)
      })

      // Log warning for significant slowdowns
      if (value > threshold * 2) {
        console.warn(`Performance issue detected: ${metricName} took ${value}ms (threshold: ${threshold}ms)`)
      }
    }
  }

  /**
   * Get threshold severity level
   */
  getThresholdSeverity(value, threshold) {
    const ratio = value / threshold
    if (ratio < 1.5) return 'low'
    if (ratio < 2) return 'medium'
    if (ratio < 3) return 'high'
    return 'critical'
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const healthMetrics = {
      memoryUsage: this.getMemoryUsage(),
      connectionSpeed: this.getConnectionSpeed(),
      errorRate: this.getErrorRate(),
      averageResponseTime: this.getAverageResponseTime()
    }

    this.recordMetric('health.check', 1, healthMetrics)
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  /**
   * Get connection speed estimate
   */
  getConnectionSpeed() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      }
    }
    return null
  }

  /**
   * Calculate error rate from recent metrics
   */
  getErrorRate() {
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // Last 5 minutes
    const totalOperations = recentMetrics.length
    const errorOperations = recentMetrics.filter(m => m.metadata.success === false).length

    return totalOperations > 0 ? (errorOperations / totalOperations) * 100 : 0
  }

  /**
   * Calculate average response time
   */
  getAverageResponseTime() {
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // Last 5 minutes
    if (recentMetrics.length === 0) return 0

    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.value, 0)
    return totalTime / recentMetrics.length
  }

  /**
   * Get recent metrics within timeframe
   */
  getRecentMetrics(timeframe) {
    const cutoff = Date.now() - timeframe
    const recentMetrics = []

    this.metrics.forEach((metricList) => {
      metricList.forEach((metric) => {
        if (metric.timestamp > cutoff) {
          recentMetrics.push(metric)
        }
      })
    })

    return recentMetrics
  }

  /**
   * Get session identifier
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
    return this.sessionId
  }

  /**
   * Send metrics to external monitoring service
   */
  sendToMonitoringService(metric) {
    // This would integrate with services like DataDog, New Relic, etc.
    // For now, we'll just store in localStorage for debugging
    try {
      const key = 'commentator_metrics'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(metric)

      // Keep only last 1000 metrics in localStorage
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000)
      }

      localStorage.setItem(key, JSON.stringify(existing))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary = {
      session: this.getSessionId(),
      timestamp: Date.now(),
      metrics: {},
      health: {
        memoryUsage: this.getMemoryUsage(),
        connectionSpeed: this.getConnectionSpeed(),
        errorRate: this.getErrorRate(),
        averageResponseTime: this.getAverageResponseTime()
      }
    }

    // Aggregate metrics by category
    this.metrics.forEach((metricList, name) => {
      if (metricList.length > 0) {
        const values = metricList.map(m => m.value)
        summary.metrics[name] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: metricList[metricList.length - 1]
        }
      }
    })

    return summary
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    const data = {
      session: this.getSessionId(),
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      summary: this.getSummary()
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear()
    this.startTimes.clear()
  }
}

// Global instance
const performanceMonitor = new PerformanceMonitor()

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor, performanceMonitor }
} else if (typeof window !== 'undefined') {
  window.CommentatorPerformance = { PerformanceMonitor, performanceMonitor }
}