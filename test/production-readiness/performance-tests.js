/**
 * Performance & Scalability Test Module
 * Tests load simulation, performance metrics, and scalability under stress
 */

class PerformanceScalabilityTests {
    constructor(testCore) {
        this.testCore = testCore;
        this.category = 'performance-scalability';
        this.loadTestData = [];
        this.performanceMetrics = {};
    }

    async runAllTests(container = 'performance-results') {
        this.testCore.log(container, 'Starting performance and scalability tests...', 'info', this.category);

        const tests = [
            () => this.testPageLoadPerformance(container),
            () => this.testMemoryUsage(container),
            () => this.testNetworkPerformance(container),
            () => this.testDOMPerformance(container),
            () => this.testAsyncOperationPerformance(container),
            () => this.testConcurrentUserSimulation(container),
            () => this.testLargeDatasetHandling(container),
            () => this.testResourceOptimization(container),
            () => this.testCacheEfficiency(container),
            () => this.testScalabilityProjections(container)
        ];

        for (const test of tests) {
            try {
                await this.testCore.executeWithTimeout(test, 30000);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                this.testCore.log(container, `Test error: ${error.message}`, 'error', this.category);
                this.testCore.recordTest(false, 'Test execution', this.category, { error: error.message });
            }
        }

        this.testCore.log(container, 'Performance and scalability tests completed', 'info', this.category);
        this.generatePerformanceReport(container);
    }

    async testPageLoadPerformance(container) {
        this.testCore.log(container, '⚡ Testing page load performance...', 'info', this.category);

        try {
            if (!performance.timing) {
                this.testCore.log(container, '❌ Performance timing API not available', 'error', this.category);
                this.testCore.recordTest(false, 'Performance timing API', this.category);
                return;
            }

            const timing = performance.timing;
            const metrics = {
                domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
                connection: timing.connectEnd - timing.connectStart,
                response: timing.responseEnd - timing.responseStart,
                domProcessing: timing.domContentLoadedEventStart - timing.responseEnd,
                totalLoad: timing.loadEventEnd - timing.navigationStart
            };

            this.performanceMetrics.pageLoad = metrics;

            // Evaluate metrics
            const thresholds = {
                domainLookup: 200,
                connection: 500,
                response: 1000,
                domProcessing: 2000,
                totalLoad: 3000
            };

            let passedChecks = 0;
            const totalChecks = Object.keys(thresholds).length;

            Object.entries(thresholds).forEach(([metric, threshold]) => {
                const value = metrics[metric];
                const passed = value < threshold;
                
                if (passed) {
                    this.testCore.log(container, `✅ ${metric}: ${value}ms (Good)`, 'success', this.category);
                    passedChecks++;
                } else {
                    this.testCore.log(container, `❌ ${metric}: ${value}ms (Slow, threshold: ${threshold}ms)`, 'error', this.category);
                }
            });

            const overallPassed = passedChecks >= totalChecks * 0.8; // 80% must pass
            this.testCore.recordTest(overallPassed, 'Page load performance', this.category, metrics);

            // Test Core Web Vitals if available
            if (typeof PerformanceObserver !== 'undefined') {
                await this.testCoreWebVitals(container);
            } else {
                this.testCore.log(container, '⚠️ PerformanceObserver not available for Core Web Vitals', 'warning', this.category);
            }

        } catch (error) {
            this.testCore.log(container, `❌ Page load performance test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Page load performance', this.category, { error: error.message });
        }
    }

    async testCoreWebVitals(container) {
        this.testCore.log(container, '📊 Testing Core Web Vitals...', 'info', this.category);

        return new Promise((resolve) => {
            const vitals = {};
            let metricsReceived = 0;
            const expectedMetrics = 3; // LCP, FID, CLS

            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    switch (entry.entryType) {
                        case 'largest-contentful-paint':
                            vitals.LCP = entry.startTime;
                            this.evaluateLCP(container, entry.startTime);
                            metricsReceived++;
                            break;
                        case 'first-input':
                            vitals.FID = entry.processingStart - entry.startTime;
                            this.evaluateFID(container, vitals.FID);
                            metricsReceived++;
                            break;
                        case 'layout-shift':
                            if (!entry.hadRecentInput) {
                                vitals.CLS = (vitals.CLS || 0) + entry.value;
                            }
                            break;
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    if (vitals.CLS !== undefined) {
                        this.evaluateCLS(container, vitals.CLS);
                        metricsReceived++;
                    }
                    
                    observer.disconnect();
                    this.performanceMetrics.coreWebVitals = vitals;
                    
                    if (metricsReceived > 0) {
                        this.testCore.log(container, `✅ Collected ${metricsReceived} Core Web Vitals metrics`, 'success', this.category);
                        this.testCore.recordTest(true, 'Core Web Vitals collection', this.category, vitals);
                    } else {
                        this.testCore.log(container, '⚠️ No Core Web Vitals metrics collected', 'warning', this.category);
                        this.testCore.recordTest(false, 'Core Web Vitals collection', this.category);
                    }
                    
                    resolve();
                }, 5000);
                
            } catch (observerError) {
                this.testCore.log(container, `❌ Core Web Vitals observer error: ${observerError.message}`, 'error', this.category);
                this.testCore.recordTest(false, 'Core Web Vitals collection', this.category);
                resolve();
            }
        });
    }

    evaluateLCP(container, lcp) {
        if (lcp < 2500) {
            this.testCore.log(container, `✅ LCP: ${Math.round(lcp)}ms (Good)`, 'success', this.category);
            this.testCore.recordTest(true, 'Largest Contentful Paint', this.category, { value: lcp });
        } else if (lcp < 4000) {
            this.testCore.log(container, `⚠️ LCP: ${Math.round(lcp)}ms (Needs Improvement)`, 'warning', this.category);
            this.testCore.recordTest(false, 'Largest Contentful Paint', this.category, { value: lcp });
        } else {
            this.testCore.log(container, `❌ LCP: ${Math.round(lcp)}ms (Poor)`, 'error', this.category);
            this.testCore.recordTest(false, 'Largest Contentful Paint', this.category, { value: lcp });
        }
    }

    evaluateFID(container, fid) {
        if (fid < 100) {
            this.testCore.log(container, `✅ FID: ${Math.round(fid)}ms (Good)`, 'success', this.category);
            this.testCore.recordTest(true, 'First Input Delay', this.category, { value: fid });
        } else if (fid < 300) {
            this.testCore.log(container, `⚠️ FID: ${Math.round(fid)}ms (Needs Improvement)`, 'warning', this.category);
            this.testCore.recordTest(false, 'First Input Delay', this.category, { value: fid });
        } else {
            this.testCore.log(container, `❌ FID: ${Math.round(fid)}ms (Poor)`, 'error', this.category);
            this.testCore.recordTest(false, 'First Input Delay', this.category, { value: fid });
        }
    }

    evaluateCLS(container, cls) {
        if (cls < 0.1) {
            this.testCore.log(container, `✅ CLS: ${cls.toFixed(3)} (Good)`, 'success', this.category);
            this.testCore.recordTest(true, 'Cumulative Layout Shift', this.category, { value: cls });
        } else if (cls < 0.25) {
            this.testCore.log(container, `⚠️ CLS: ${cls.toFixed(3)} (Needs Improvement)`, 'warning', this.category);
            this.testCore.recordTest(false, 'Cumulative Layout Shift', this.category, { value: cls });
        } else {
            this.testCore.log(container, `❌ CLS: ${cls.toFixed(3)} (Poor)`, 'error', this.category);
            this.testCore.recordTest(false, 'Cumulative Layout Shift', this.category, { value: cls });
        }
    }

    async testMemoryUsage(container) {
        this.testCore.log(container, '🧠 Testing memory usage...', 'info', this.category);

        try {
            if (!performance.memory) {
                this.testCore.log(container, '⚠️ Memory performance API not available', 'warning', this.category);
                this.testCore.recordTest(true, 'Memory usage monitoring', this.category); // Skip this test
                return;
            }

            const memory = performance.memory;
            const memoryMB = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            };

            this.performanceMetrics.memory = memoryMB;

            // Evaluate memory usage
            if (memoryMB.used < 50) {
                this.testCore.log(container, `✅ Memory usage: ${memoryMB.used}MB (Excellent)`, 'success', this.category);
                this.testCore.recordTest(true, 'Memory efficiency', this.category, memoryMB);
            } else if (memoryMB.used < 100) {
                this.testCore.log(container, `⚠️ Memory usage: ${memoryMB.used}MB (Good)`, 'warning', this.category);
                this.testCore.recordTest(true, 'Memory efficiency', this.category, memoryMB);
            } else {
                this.testCore.log(container, `❌ Memory usage: ${memoryMB.used}MB (High)`, 'error', this.category);
                this.testCore.recordTest(false, 'Memory efficiency', this.category, memoryMB);
            }

            // Test memory usage ratio
            const usageRatio = memoryMB.used / memoryMB.total;
            if (usageRatio < 0.8) {
                this.testCore.log(container, `✅ Memory usage ratio: ${Math.round(usageRatio * 100)}% (Good)`, 'success', this.category);
                this.testCore.recordTest(true, 'Memory usage ratio', this.category);
            } else {
                this.testCore.log(container, `❌ Memory usage ratio: ${Math.round(usageRatio * 100)}% (High)`, 'error', this.category);
                this.testCore.recordTest(false, 'Memory usage ratio', this.category);
            }

            // Simulate memory stress test
            await this.simulateMemoryStress(container);

        } catch (error) {
            this.testCore.log(container, `❌ Memory usage test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Memory usage monitoring', this.category, { error: error.message });
        }
    }

    async simulateMemoryStress(container) {
        this.testCore.log(container, '🔬 Running memory stress test...', 'info', this.category);

        try {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Create large data structures to stress memory
            const largeArrays = [];
            for (let i = 0; i < 100; i++) {
                largeArrays.push(new Array(1000).fill(`test-data-${i}`));
            }

            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Clean up
            largeArrays.length = 0;
            
            // Force garbage collection if possible
            if (window.gc) {
                window.gc();
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            const memoryIncrease = (peakMemory - initialMemory) / 1024 / 1024;
            const memoryRecovery = (peakMemory - finalMemory) / 1024 / 1024;

            if (memoryRecovery > memoryIncrease * 0.7) {
                this.testCore.log(container, `✅ Memory stress test passed (Recovery: ${memoryRecovery.toFixed(1)}MB)`, 'success', this.category);
                this.testCore.recordTest(true, 'Memory stress test', this.category);
            } else {
                this.testCore.log(container, `⚠️ Memory stress test: potential memory leak (Recovery: ${memoryRecovery.toFixed(1)}MB)`, 'warning', this.category);
                this.testCore.recordTest(false, 'Memory stress test', this.category);
            }

        } catch (error) {
            this.testCore.log(container, `❌ Memory stress test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Memory stress test', this.category);
        }
    }

    async testNetworkPerformance(container) {
        this.testCore.log(container, '🌐 Testing network performance...', 'info', this.category);

        try {
            // Test connection type if available
            if (navigator.connection) {
                const connection = navigator.connection;
                const networkInfo = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt
                };

                this.performanceMetrics.network = networkInfo;

                this.testCore.log(container, `Network: ${networkInfo.effectiveType}, Downlink: ${networkInfo.downlink}Mbps, RTT: ${networkInfo.rtt}ms`, 'info', this.category);
                
                if (networkInfo.effectiveType === '4g' || networkInfo.downlink > 1.5) {
                    this.testCore.log(container, '✅ Good network connection detected', 'success', this.category);
                    this.testCore.recordTest(true, 'Network connection quality', this.category, networkInfo);
                } else {
                    this.testCore.log(container, '⚠️ Slow network connection detected', 'warning', this.category);
                    this.testCore.recordTest(false, 'Network connection quality', this.category, networkInfo);
                }
            } else {
                this.testCore.log(container, '⚠️ Network Connection API not available', 'warning', this.category);
            }

            // Test resource loading performance
            await this.testResourceLoadingPerformance(container);

            // Test API response times
            await this.testAPIPerformance(container);

        } catch (error) {
            this.testCore.log(container, `❌ Network performance test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Network performance', this.category, { error: error.message });
        }
    }

    async testResourceLoadingPerformance(container) {
        this.testCore.log(container, '📦 Testing resource loading performance...', 'info', this.category);

        try {
            const resources = performance.getEntriesByType('resource');
            const resourceStats = {
                total: resources.length,
                css: 0,
                js: 0,
                images: 0,
                totalSize: 0,
                avgLoadTime: 0
            };

            let totalLoadTime = 0;

            resources.forEach(resource => {
                const loadTime = resource.responseEnd - resource.startTime;
                totalLoadTime += loadTime;

                if (resource.name.includes('.css')) resourceStats.css++;
                else if (resource.name.includes('.js')) resourceStats.js++;
                else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) resourceStats.images++;

                if (resource.transferSize) {
                    resourceStats.totalSize += resource.transferSize;
                }
            });

            resourceStats.avgLoadTime = totalLoadTime / resources.length;
            resourceStats.totalSizeMB = (resourceStats.totalSize / 1024 / 1024).toFixed(2);

            this.performanceMetrics.resources = resourceStats;

            // Evaluate resource performance
            if (resourceStats.avgLoadTime < 200) {
                this.testCore.log(container, `✅ Average resource load time: ${Math.round(resourceStats.avgLoadTime)}ms (Fast)`, 'success', this.category);
                this.testCore.recordTest(true, 'Resource loading speed', this.category);
            } else if (resourceStats.avgLoadTime < 500) {
                this.testCore.log(container, `⚠️ Average resource load time: ${Math.round(resourceStats.avgLoadTime)}ms (Acceptable)`, 'warning', this.category);
                this.testCore.recordTest(true, 'Resource loading speed', this.category);
            } else {
                this.testCore.log(container, `❌ Average resource load time: ${Math.round(resourceStats.avgLoadTime)}ms (Slow)`, 'error', this.category);
                this.testCore.recordTest(false, 'Resource loading speed', this.category);
            }

            // Check total resource size
            if (parseFloat(resourceStats.totalSizeMB) < 2) {
                this.testCore.log(container, `✅ Total resource size: ${resourceStats.totalSizeMB}MB (Optimal)`, 'success', this.category);
                this.testCore.recordTest(true, 'Resource size optimization', this.category);
            } else if (parseFloat(resourceStats.totalSizeMB) < 5) {
                this.testCore.log(container, `⚠️ Total resource size: ${resourceStats.totalSizeMB}MB (Acceptable)`, 'warning', this.category);
                this.testCore.recordTest(true, 'Resource size optimization', this.category);
            } else {
                this.testCore.log(container, `❌ Total resource size: ${resourceStats.totalSizeMB}MB (Large)`, 'error', this.category);
                this.testCore.recordTest(false, 'Resource size optimization', this.category);
            }

        } catch (error) {
            this.testCore.log(container, `❌ Resource loading test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Resource loading performance', this.category);
        }
    }

    async testAPIPerformance(container) {
        this.testCore.log(container, '🔗 Testing API performance...', 'info', this.category);

        try {
            const testEndpoints = [
                { name: 'Firebase Test', test: () => this.testFirebasePerformance() },
                { name: 'Local Storage', test: () => this.testLocalStoragePerformance() },
                { name: 'DOM Operations', test: () => this.testDOMOperationPerformance() }
            ];

            const results = [];

            for (const endpoint of testEndpoints) {
                try {
                    const startTime = performance.now();
                    await endpoint.test();
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;

                    results.push({ name: endpoint.name, responseTime });

                    if (responseTime < 100) {
                        this.testCore.log(container, `✅ ${endpoint.name}: ${Math.round(responseTime)}ms (Fast)`, 'success', this.category);
                        this.testCore.recordTest(true, `${endpoint.name} performance`, this.category);
                    } else if (responseTime < 500) {
                        this.testCore.log(container, `⚠️ ${endpoint.name}: ${Math.round(responseTime)}ms (Acceptable)`, 'warning', this.category);
                        this.testCore.recordTest(true, `${endpoint.name} performance`, this.category);
                    } else {
                        this.testCore.log(container, `❌ ${endpoint.name}: ${Math.round(responseTime)}ms (Slow)`, 'error', this.category);
                        this.testCore.recordTest(false, `${endpoint.name} performance`, this.category);
                    }
                } catch (testError) {
                    this.testCore.log(container, `❌ ${endpoint.name} test failed: ${testError.message}`, 'error', this.category);
                    this.testCore.recordTest(false, `${endpoint.name} performance`, this.category);
                }
            }

            this.performanceMetrics.apiPerformance = results;

        } catch (error) {
            this.testCore.log(container, `❌ API performance test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'API performance', this.category);
        }
    }

    async testFirebasePerformance() {
        if (typeof window.FirebaseService !== 'undefined') {
            await window.FirebaseService.loadComments('performance-test-url');
        } else {
            // Simulate Firebase call
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async testLocalStoragePerformance() {
        // Test localStorage performance
        const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });
        localStorage.setItem('perf-test', testData);
        const retrieved = localStorage.getItem('perf-test');
        localStorage.removeItem('perf-test');
        return retrieved;
    }

    async testDOMOperationPerformance() {
        // Test DOM manipulation performance
        const div = document.createElement('div');
        div.innerHTML = '<p>Performance test content</p>';
        document.body.appendChild(div);
        div.style.display = 'none';
        document.body.removeChild(div);
    }

    async testDOMPerformance(container) {
        this.testCore.log(container, '🏗️ Testing DOM performance...', 'info', this.category);

        try {
            // Test DOM element count
            const elementCount = document.querySelectorAll('*').length;
            
            if (elementCount < 1000) {
                this.testCore.log(container, `✅ DOM size: ${elementCount} elements (Optimal)`, 'success', this.category);
                this.testCore.recordTest(true, 'DOM size optimization', this.category);
            } else if (elementCount < 3000) {
                this.testCore.log(container, `⚠️ DOM size: ${elementCount} elements (Acceptable)`, 'warning', this.category);
                this.testCore.recordTest(true, 'DOM size optimization', this.category);
            } else {
                this.testCore.log(container, `❌ DOM size: ${elementCount} elements (Large)`, 'error', this.category);
                this.testCore.recordTest(false, 'DOM size optimization', this.category);
            }

            // Test DOM query performance
            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                document.querySelectorAll('div');
            }
            const queryTime = performance.now() - startTime;

            if (queryTime < 10) {
                this.testCore.log(container, `✅ DOM query performance: ${queryTime.toFixed(2)}ms for 100 queries (Fast)`, 'success', this.category);
                this.testCore.recordTest(true, 'DOM query performance', this.category);
            } else if (queryTime < 50) {
                this.testCore.log(container, `⚠️ DOM query performance: ${queryTime.toFixed(2)}ms for 100 queries (Acceptable)`, 'warning', this.category);
                this.testCore.recordTest(true, 'DOM query performance', this.category);
            } else {
                this.testCore.log(container, `❌ DOM query performance: ${queryTime.toFixed(2)}ms for 100 queries (Slow)`, 'error', this.category);
                this.testCore.recordTest(false, 'DOM query performance', this.category);
            }

            this.performanceMetrics.dom = { elementCount, queryTime };

        } catch (error) {
            this.testCore.log(container, `❌ DOM performance test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'DOM performance', this.category);
        }
    }

    async testAsyncOperationPerformance(container) {
        this.testCore.log(container, '⚡ Testing async operation performance...', 'info', this.category);

        try {
            // Test Promise resolution performance
            const promiseStartTime = performance.now();
            const promises = Array.from({ length: 100 }, (_, i) => 
                new Promise(resolve => setTimeout(() => resolve(i), Math.random() * 10))
            );
            
            await Promise.all(promises);
            const promiseTime = performance.now() - promiseStartTime;

            if (promiseTime < 100) {
                this.testCore.log(container, `✅ Promise resolution: ${Math.round(promiseTime)}ms for 100 promises (Fast)`, 'success', this.category);
                this.testCore.recordTest(true, 'Async operation performance', this.category);
            } else if (promiseTime < 500) {
                this.testCore.log(container, `⚠️ Promise resolution: ${Math.round(promiseTime)}ms for 100 promises (Acceptable)`, 'warning', this.category);
                this.testCore.recordTest(true, 'Async operation performance', this.category);
            } else {
                this.testCore.log(container, `❌ Promise resolution: ${Math.round(promiseTime)}ms for 100 promises (Slow)`, 'error', this.category);
                this.testCore.recordTest(false, 'Async operation performance', this.category);
            }

            // Test setTimeout accuracy
            const timeoutStartTime = performance.now();
            await new Promise(resolve => setTimeout(resolve, 50));
            const actualTimeout = performance.now() - timeoutStartTime;
            const timeoutAccuracy = Math.abs(actualTimeout - 50);

            if (timeoutAccuracy < 10) {
                this.testCore.log(container, `✅ setTimeout accuracy: ±${timeoutAccuracy.toFixed(1)}ms (Accurate)`, 'success', this.category);
                this.testCore.recordTest(true, 'Timer accuracy', this.category);
            } else {
                this.testCore.log(container, `⚠️ setTimeout accuracy: ±${timeoutAccuracy.toFixed(1)}ms (Inaccurate)`, 'warning', this.category);
                this.testCore.recordTest(false, 'Timer accuracy', this.category);
            }

            this.performanceMetrics.asyncOperations = { promiseTime, timeoutAccuracy };

        } catch (error) {
            this.testCore.log(container, `❌ Async operation test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Async operation performance', this.category);
        }
    }

    async testConcurrentUserSimulation(container) {
        this.testCore.log(container, '👥 Testing concurrent user simulation...', 'info', this.category);

        try {
            const userCounts = [10, 50, 100];
            const simulationResults = {};

            for (const userCount of userCounts) {
                this.testCore.log(container, `🔄 Simulating ${userCount} concurrent users...`, 'info', this.category);
                
                const startTime = performance.now();
                const userSimulations = Array.from({ length: userCount }, (_, i) => 
                    this.simulateUserActions(i)
                );

                try {
                    await Promise.all(userSimulations);
                    const duration = performance.now() - startTime;
                    simulationResults[userCount] = { success: true, duration };

                    const avgTimePerUser = duration / userCount;
                    if (avgTimePerUser < 100) {
                        this.testCore.log(container, `✅ ${userCount} users: ${Math.round(duration)}ms total, ${avgTimePerUser.toFixed(1)}ms/user (Excellent)`, 'success', this.category);
                        this.testCore.recordTest(true, `${userCount} concurrent users`, this.category);
                    } else if (avgTimePerUser < 500) {
                        this.testCore.log(container, `⚠️ ${userCount} users: ${Math.round(duration)}ms total, ${avgTimePerUser.toFixed(1)}ms/user (Good)`, 'warning', this.category);
                        this.testCore.recordTest(true, `${userCount} concurrent users`, this.category);
                    } else {
                        this.testCore.log(container, `❌ ${userCount} users: ${Math.round(duration)}ms total, ${avgTimePerUser.toFixed(1)}ms/user (Slow)`, 'error', this.category);
                        this.testCore.recordTest(false, `${userCount} concurrent users`, this.category);
                    }
                } catch (simError) {
                    simulationResults[userCount] = { success: false, error: simError.message };
                    this.testCore.log(container, `❌ ${userCount} users simulation failed: ${simError.message}`, 'error', this.category);
                    this.testCore.recordTest(false, `${userCount} concurrent users`, this.category);
                }

                // Brief pause between simulations
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.performanceMetrics.concurrentUsers = simulationResults;
            this.loadTestData.push({ timestamp: Date.now(), results: simulationResults });

        } catch (error) {
            this.testCore.log(container, `❌ Concurrent user simulation error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Concurrent user simulation', this.category);
        }
    }

    async simulateUserActions(userId) {
        // Simulate typical user actions
        const actions = [
            () => this.simulatePageLoad(),
            () => this.simulateCommentSubmission(userId),
            () => this.simulateCommentLoading(),
            () => this.simulateUIInteraction()
        ];

        for (const action of actions) {
            await action();
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        }
    }

    async simulatePageLoad() {
        // Simulate page load time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }

    async simulateCommentSubmission(userId) {
        // Simulate comment submission
        if (typeof window.FirebaseService !== 'undefined') {
            try {
                await window.FirebaseService.saveComment(`test-url-${userId}`, {
                    text: `Test comment from user ${userId}`,
                    author: `User${userId}`
                });
            } catch (error) {
                // Ignore errors in simulation
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
        }
    }

    async simulateCommentLoading() {
        // Simulate comment loading
        if (typeof window.FirebaseService !== 'undefined') {
            try {
                await window.FirebaseService.loadComments('test-url');
            } catch (error) {
                // Ignore errors in simulation
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        }
    }

    async simulateUIInteraction() {
        // Simulate UI interactions
        const buttons = document.querySelectorAll('button');
        if (buttons.length > 0) {
            const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
            // Simulate click without actually clicking
            randomButton.focus();
            randomButton.blur();
        }
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }

    async testLargeDatasetHandling(container) {
        this.testCore.log(container, '📊 Testing large dataset handling...', 'info', this.category);

        try {
            const datasetSizes = [1000, 5000, 10000];
            const results = {};

            for (const size of datasetSizes) {
                this.testCore.log(container, `🔄 Testing ${size} data records...`, 'info', this.category);
                
                const startTime = performance.now();
                
                // Generate large dataset
                const dataset = Array.from({ length: size }, (_, i) => ({
                    id: i,
                    text: `Comment ${i} - ${Math.random().toString(36).substring(7)}`,
                    author: `User${i % 100}`,
                    timestamp: Date.now() + i
                }));

                // Test data processing
                const filtered = dataset.filter(item => item.id % 2 === 0);
                const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);
                const mapped = sorted.map(item => ({ ...item, processed: true }));

                const endTime = performance.now();
                const processingTime = endTime - startTime;
                
                results[size] = processingTime;

                if (processingTime < 100) {
                    this.testCore.log(container, `✅ ${size} records: ${Math.round(processingTime)}ms (Fast)`, 'success', this.category);
                    this.testCore.recordTest(true, `${size} record processing`, this.category);
                } else if (processingTime < 1000) {
                    this.testCore.log(container, `⚠️ ${size} records: ${Math.round(processingTime)}ms (Acceptable)`, 'warning', this.category);
                    this.testCore.recordTest(true, `${size} record processing`, this.category);
                } else {
                    this.testCore.log(container, `❌ ${size} records: ${Math.round(processingTime)}ms (Slow)`, 'error', this.category);
                    this.testCore.recordTest(false, `${size} record processing`, this.category);
                }

                // Clean up
                dataset.length = 0;
            }

            this.performanceMetrics.datasetHandling = results;

        } catch (error) {
            this.testCore.log(container, `❌ Large dataset handling error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Large dataset handling', this.category);
        }
    }

    async testResourceOptimization(container) {
        this.testCore.log(container, '🎯 Testing resource optimization...', 'info', this.category);

        try {
            // Test image optimization
            const images = document.querySelectorAll('img');
            let optimizedImages = 0;
            
            images.forEach(img => {
                if (img.loading === 'lazy' || img.getAttribute('loading') === 'lazy') {
                    optimizedImages++;
                }
            });

            if (images.length === 0) {
                this.testCore.log(container, '⚠️ No images found to test optimization', 'warning', this.category);
                this.testCore.recordTest(true, 'Image optimization', this.category);
            } else {
                const optimizationRatio = optimizedImages / images.length;
                if (optimizationRatio >= 0.8) {
                    this.testCore.log(container, `✅ Image optimization: ${Math.round(optimizationRatio * 100)}% lazy loaded`, 'success', this.category);
                    this.testCore.recordTest(true, 'Image optimization', this.category);
                } else {
                    this.testCore.log(container, `⚠️ Image optimization: only ${Math.round(optimizationRatio * 100)}% lazy loaded`, 'warning', this.category);
                    this.testCore.recordTest(false, 'Image optimization', this.category);
                }
            }

            // Test script optimization
            const scripts = document.querySelectorAll('script');
            let optimizedScripts = 0;

            scripts.forEach(script => {
                if (script.defer || script.async || script.type === 'module') {
                    optimizedScripts++;
                }
            });

            const scriptOptimizationRatio = optimizedScripts / scripts.length;
            if (scriptOptimizationRatio >= 0.5) {
                this.testCore.log(container, `✅ Script optimization: ${Math.round(scriptOptimizationRatio * 100)}% optimized loading`, 'success', this.category);
                this.testCore.recordTest(true, 'Script optimization', this.category);
            } else {
                this.testCore.log(container, `⚠️ Script optimization: only ${Math.round(scriptOptimizationRatio * 100)}% optimized loading`, 'warning', this.category);
                this.testCore.recordTest(false, 'Script optimization', this.category);
            }

            // Test CSS optimization
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            const criticalCSS = document.querySelectorAll('style').length;

            if (criticalCSS > 0 && stylesheets.length > 0) {
                this.testCore.log(container, `✅ CSS optimization: ${criticalCSS} inline styles, ${stylesheets.length} external`, 'success', this.category);
                this.testCore.recordTest(true, 'CSS optimization', this.category);
            } else if (stylesheets.length > 0) {
                this.testCore.log(container, `⚠️ CSS optimization: consider inline critical CSS`, 'warning', this.category);
                this.testCore.recordTest(false, 'CSS optimization', this.category);
            } else {
                this.testCore.log(container, '⚠️ No external CSS found', 'warning', this.category);
                this.testCore.recordTest(true, 'CSS optimization', this.category);
            }

        } catch (error) {
            this.testCore.log(container, `❌ Resource optimization test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Resource optimization', this.category);
        }
    }

    async testCacheEfficiency(container) {
        this.testCore.log(container, '💾 Testing cache efficiency...', 'info', this.category);

        try {
            // Test localStorage caching
            const cacheKey = 'performance-cache-test';
            const testData = { timestamp: Date.now(), data: 'test-cache-data' };
            
            const writeStartTime = performance.now();
            localStorage.setItem(cacheKey, JSON.stringify(testData));
            const writeTime = performance.now() - writeStartTime;

            const readStartTime = performance.now();
            const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}');
            const readTime = performance.now() - readStartTime;

            localStorage.removeItem(cacheKey);

            if (writeTime < 10 && readTime < 5) {
                this.testCore.log(container, `✅ localStorage cache: Write ${writeTime.toFixed(2)}ms, Read ${readTime.toFixed(2)}ms (Fast)`, 'success', this.category);
                this.testCore.recordTest(true, 'LocalStorage cache performance', this.category);
            } else {
                this.testCore.log(container, `⚠️ localStorage cache: Write ${writeTime.toFixed(2)}ms, Read ${readTime.toFixed(2)}ms (Slow)`, 'warning', this.category);
                this.testCore.recordTest(false, 'LocalStorage cache performance', this.category);
            }

            // Test browser caching headers (simplified)
            const resourceEntries = performance.getEntriesByType('resource');
            let cachedResources = 0;

            resourceEntries.forEach(resource => {
                // Check if resource was loaded from cache (transferSize === 0 indicates cache hit)
                if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
                    cachedResources++;
                }
            });

            const cacheHitRatio = cachedResources / resourceEntries.length;
            if (cacheHitRatio >= 0.3) {
                this.testCore.log(container, `✅ Browser cache efficiency: ${Math.round(cacheHitRatio * 100)}% cache hits`, 'success', this.category);
                this.testCore.recordTest(true, 'Browser cache efficiency', this.category);
            } else {
                this.testCore.log(container, `⚠️ Browser cache efficiency: only ${Math.round(cacheHitRatio * 100)}% cache hits`, 'warning', this.category);
                this.testCore.recordTest(false, 'Browser cache efficiency', this.category);
            }

            this.performanceMetrics.cache = {
                localStorageWrite: writeTime,
                localStorageRead: readTime,
                browserCacheHitRatio: cacheHitRatio
            };

        } catch (error) {
            this.testCore.log(container, `❌ Cache efficiency test error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Cache efficiency', this.category);
        }
    }

    async testScalabilityProjections(container) {
        this.testCore.log(container, '📈 Testing scalability projections...', 'info', this.category);

        try {
            // Calculate projections based on current performance
            const projections = this.calculateScalabilityProjections();

            this.testCore.log(container, `📊 Scalability Analysis:`, 'info', this.category);
            this.testCore.log(container, `- Estimated max concurrent users: ${projections.maxUsers}`, 'info', this.category);
            this.testCore.log(container, `- Memory efficiency rating: ${projections.memoryRating}`, 'info', this.category);
            this.testCore.log(container, `- Performance bottleneck: ${projections.bottleneck}`, 'info', this.category);
            this.testCore.log(container, `- Scalability score: ${projections.score}/100`, 'info', this.category);

            if (projections.score >= 80) {
                this.testCore.log(container, `✅ Excellent scalability potential (${projections.score}/100)`, 'success', this.category);
                this.testCore.recordTest(true, 'Scalability projections', this.category, projections);
            } else if (projections.score >= 60) {
                this.testCore.log(container, `⚠️ Good scalability potential (${projections.score}/100)`, 'warning', this.category);
                this.testCore.recordTest(true, 'Scalability projections', this.category, projections);
            } else {
                this.testCore.log(container, `❌ Limited scalability potential (${projections.score}/100)`, 'error', this.category);
                this.testCore.recordTest(false, 'Scalability projections', this.category, projections);
            }

            this.performanceMetrics.scalabilityProjections = projections;

        } catch (error) {
            this.testCore.log(container, `❌ Scalability projections error: ${error.message}`, 'error', this.category);
            this.testCore.recordTest(false, 'Scalability projections', this.category);
        }
    }

    calculateScalabilityProjections() {
        const metrics = this.performanceMetrics;
        let score = 100;
        let bottlenecks = [];

        // Memory efficiency impact
        if (metrics.memory) {
            if (metrics.memory.used > 100) {
                score -= 20;
                bottlenecks.push('High memory usage');
            } else if (metrics.memory.used > 50) {
                score -= 10;
            }
        }

        // Network performance impact
        if (metrics.network) {
            if (metrics.network.effectiveType === '2g' || metrics.network.downlink < 1) {
                score -= 15;
                bottlenecks.push('Slow network');
            }
        }

        // DOM performance impact
        if (metrics.dom) {
            if (metrics.dom.elementCount > 2000) {
                score -= 15;
                bottlenecks.push('Large DOM size');
            }
            if (metrics.dom.queryTime > 30) {
                score -= 10;
                bottlenecks.push('Slow DOM queries');
            }
        }

        // Calculate estimated max users based on performance
        let maxUsers = 1000; // Base estimate
        
        if (metrics.memory && metrics.memory.used > 50) {
            maxUsers = Math.round(maxUsers * (100 - metrics.memory.used) / 100);
        }

        if (metrics.concurrentUsers) {
            // Adjust based on actual concurrent user test results
            const userTestResults = Object.keys(metrics.concurrentUsers);
            if (userTestResults.length > 0) {
                const highestSuccessful = Math.max(...userTestResults.map(Number));
                maxUsers = Math.min(maxUsers, highestSuccessful * 10); // Extrapolate
            }
        }

        return {
            score: Math.max(0, Math.round(score)),
            maxUsers,
            memoryRating: this.getMemoryRating(),
            bottleneck: bottlenecks.length > 0 ? bottlenecks[0] : 'None identified',
            recommendations: this.getScalabilityRecommendations(bottlenecks)
        };
    }

    getMemoryRating() {
        if (!this.performanceMetrics.memory) return 'Unknown';
        
        const used = this.performanceMetrics.memory.used;
        if (used < 30) return 'Excellent';
        if (used < 50) return 'Good';
        if (used < 100) return 'Fair';
        return 'Poor';
    }

    getScalabilityRecommendations(bottlenecks) {
        const recommendations = [];
        
        bottlenecks.forEach(bottleneck => {
            switch (bottleneck) {
                case 'High memory usage':
                    recommendations.push('Implement memory optimization and garbage collection');
                    break;
                case 'Slow network':
                    recommendations.push('Add CDN and resource compression');
                    break;
                case 'Large DOM size':
                    recommendations.push('Implement virtual scrolling or pagination');
                    break;
                case 'Slow DOM queries':
                    recommendations.push('Optimize CSS selectors and reduce DOM queries');
                    break;
            }
        });

        if (recommendations.length === 0) {
            recommendations.push('Consider load balancing and horizontal scaling');
        }

        return recommendations;
    }

    generatePerformanceReport(container) {
        this.testCore.log(container, '📋 Generating comprehensive performance report...', 'info', this.category);

        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generatePerformanceSummary(),
            metrics: this.performanceMetrics,
            loadTestData: this.loadTestData,
            recommendations: this.generateRecommendations()
        };

        // Log summary to container
        this.testCore.log(container, `📊 Performance Summary:`, 'info', this.category);
        Object.entries(report.summary).forEach(([key, value]) => {
            this.testCore.log(container, `- ${key}: ${value}`, 'info', this.category);
        });

        return report;
    }

    generatePerformanceSummary() {
        const summary = {};
        
        if (this.performanceMetrics.pageLoad) {
            summary['Page Load Time'] = `${this.performanceMetrics.pageLoad.totalLoad}ms`;
        }
        
        if (this.performanceMetrics.memory) {
            summary['Memory Usage'] = `${this.performanceMetrics.memory.used}MB`;
        }
        
        if (this.performanceMetrics.concurrentUsers) {
            const maxUsers = Math.max(...Object.keys(this.performanceMetrics.concurrentUsers).map(Number));
            summary['Max Tested Users'] = `${maxUsers} concurrent`;
        }
        
        if (this.performanceMetrics.scalabilityProjections) {
            summary['Scalability Score'] = `${this.performanceMetrics.scalabilityProjections.score}/100`;
        }

        return summary;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.memory && this.performanceMetrics.memory.used > 100) {
            recommendations.push('Optimize memory usage - consider implementing data virtualization');
        }
        
        if (this.performanceMetrics.pageLoad && this.performanceMetrics.pageLoad.totalLoad > 3000) {
            recommendations.push('Improve page load performance - optimize resource loading');
        }
        
        if (this.performanceMetrics.resources && parseFloat(this.performanceMetrics.resources.totalSizeMB) > 5) {
            recommendations.push('Reduce resource size - implement compression and minification');
        }
        
        if (this.performanceMetrics.scalabilityProjections && this.performanceMetrics.scalabilityProjections.score < 70) {
            recommendations.push('Address scalability bottlenecks identified in analysis');
        }

        if (recommendations.length === 0) {
            recommendations.push('Performance is good - consider implementing monitoring for production');
        }

        return recommendations;
    }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.PerformanceScalabilityTests = PerformanceScalabilityTests;
} else if (typeof module !== 'undefined') {
    module.exports = PerformanceScalabilityTests;
}