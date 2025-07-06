/**
 * Core Testing Framework for Production Readiness Tests
 * Provides base functionality, logging, metrics, and result management
 */

class ProductionTestCore {
    constructor() {
        this.testMetrics = {
            total: 0,
            passed: 0,
            failed: 0,
            startTime: Date.now(),
            categories: {}
        };
        this.testResults = [];
        this.loggers = new Map();
    }

    // Enhanced logging with categorization
    log(container, message, type = 'info', category = 'general') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            message,
            type,
            category,
            time: Date.now()
        };

        this.testResults.push(entry);

        // Update DOM if in browser environment
        if (typeof document !== 'undefined' && container) {
            const logElement = document.createElement('div');
            logElement.className = `log-entry status-${type}`;
            logElement.textContent = `[${timestamp}] ${message}`;
            
            const containerEl = document.getElementById(container);
            if (containerEl) {
                containerEl.appendChild(logElement);
                containerEl.scrollTop = containerEl.scrollHeight;
            }
        }

        // Console output for CI/headless environments
        const symbols = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        console.log(`${symbols[type] || 'ℹ️'} [${category}] ${message}`);
    }

    // Record test results with enhanced metrics
    recordTest(passed, testName, category = 'general', metadata = {}) {
        this.testMetrics.total++;
        
        if (!this.testMetrics.categories[category]) {
            this.testMetrics.categories[category] = { total: 0, passed: 0, failed: 0 };
        }
        
        this.testMetrics.categories[category].total++;
        
        if (passed) {
            this.testMetrics.passed++;
            this.testMetrics.categories[category].passed++;
        } else {
            this.testMetrics.failed++;
            this.testMetrics.categories[category].failed++;
        }

        // Store detailed test result
        this.testResults.push({
            testName,
            category,
            passed,
            timestamp: Date.now(),
            metadata
        });

        this.updateMetrics();
    }

    // Update visual metrics in DOM
    updateMetrics() {
        if (typeof document === 'undefined') return;

        const elements = {
            'total-tests': this.testMetrics.total,
            'passed-tests': this.testMetrics.passed,
            'failed-tests': this.testMetrics.failed
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        // Update success rate and progress
        const successRate = this.testMetrics.total > 0 
            ? Math.round((this.testMetrics.passed / this.testMetrics.total) * 100) 
            : 0;
        
        const successEl = document.getElementById('success-rate');
        if (successEl) successEl.textContent = successRate + '%';

        const progressEl = document.getElementById('overall-progress');
        if (progressEl) {
            const progress = this.testMetrics.total > 0 
                ? (this.testMetrics.passed / this.testMetrics.total) * 100 
                : 0;
            progressEl.style.width = progress + '%';
        }

        // Update overall status
        this.updateOverallStatus(successRate);
    }

    updateOverallStatus(successRate) {
        const statusEl = document.getElementById('overall-status');
        if (!statusEl) return;

        if (this.testMetrics.total === 0) {
            statusEl.className = 'status status-info';
            statusEl.textContent = 'Ready to start testing...';
        } else if (successRate === 100) {
            statusEl.className = 'status status-success';
            statusEl.textContent = '✅ All tests passed! System is production ready.';
        } else if (successRate >= 80) {
            statusEl.className = 'status status-warning';
            statusEl.textContent = `⚠️ ${successRate}% tests passed. Some issues need attention.`;
        } else {
            statusEl.className = 'status status-error';
            statusEl.textContent = `❌ ${successRate}% tests passed. Critical issues found.`;
        }
    }

    // Generate structured test report
    generateReport(format = 'json') {
        const duration = Date.now() - this.testMetrics.startTime;
        const report = {
            summary: {
                ...this.testMetrics,
                duration,
                successRate: this.testMetrics.total > 0 
                    ? (this.testMetrics.passed / this.testMetrics.total) * 100 
                    : 0,
                timestamp: new Date().toISOString()
            },
            categories: this.testMetrics.categories,
            detailedResults: this.testResults.filter(r => r.testName),
            logs: this.testResults.filter(r => !r.testName)
        };

        if (format === 'junit') {
            return this.generateJUnitXML(report);
        }
        
        return JSON.stringify(report, null, 2);
    }

    // Generate JUnit XML format for CI integration
    generateJUnitXML(report) {
        const { summary, detailedResults } = report;
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<testsuites tests="${summary.total}" failures="${summary.failed}" time="${summary.duration / 1000}">\n`;
        
        Object.entries(summary.categories).forEach(([category, stats]) => {
            xml += `  <testsuite name="${category}" tests="${stats.total}" failures="${stats.failed}" time="0">\n`;
            
            const categoryTests = detailedResults.filter(r => r.category === category);
            categoryTests.forEach(test => {
                xml += `    <testcase name="${test.testName}" time="0">\n`;
                if (!test.passed) {
                    xml += `      <failure message="Test failed">Test ${test.testName} failed</failure>\n`;
                }
                xml += `    </testcase>\n`;
            });
            
            xml += `  </testsuite>\n`;
        });
        
        xml += `</testsuites>`;
        return xml;
    }

    // Export results for download
    exportResults(format = 'json', filename = null) {
        if (typeof document === 'undefined') {
            // Node.js environment - write to file
            const fs = require('fs');
            const path = require('path');
            const data = this.generateReport(format);
            const ext = format === 'junit' ? 'xml' : 'json';
            const defaultFilename = `production-readiness-results-${Date.now()}.${ext}`;
            const filepath = path.join(process.cwd(), filename || defaultFilename);
            fs.writeFileSync(filepath, data);
            console.log(`Results exported to: ${filepath}`);
            return filepath;
        }

        // Browser environment - trigger download
        const data = this.generateReport(format);
        const blob = new Blob([data], { 
            type: format === 'junit' ? 'text/xml' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ext = format === 'junit' ? 'xml' : 'json';
        a.href = url;
        a.download = filename || `production-readiness-results-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Reset test state
    reset() {
        this.testMetrics = {
            total: 0,
            passed: 0,
            failed: 0,
            startTime: Date.now(),
            categories: {}
        };
        this.testResults = [];
        this.updateMetrics();
    }

    // Utility function for async test execution with timeout
    async executeWithTimeout(testFunction, timeout = 30000) {
        return Promise.race([
            testFunction(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Test timeout')), timeout)
            )
        ]);
    }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.ProductionTestCore = ProductionTestCore;
} else if (typeof module !== 'undefined') {
    module.exports = ProductionTestCore;
}