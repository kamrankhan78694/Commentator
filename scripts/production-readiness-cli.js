#!/usr/bin/env node

/**
 * CLI automation script for Production Readiness Tests
 * Enables headless execution for CI/CD pipelines
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionReadinessCLI {
    constructor() {
        this.serverProcess = null;
        this.port = process.env.PORT || 3000;
        this.testUrl = `http://localhost:${this.port}/production-readiness-test.html`;
        this.outputDir = process.env.OUTPUT_DIR || './test-results';
        this.config = {
            timeout: 300000, // 5 minutes
            retries: 3,
            headless: true,
            exportFormat: 'both' // json, junit, both
        };
    }

    async run() {
        console.log('🚀 Starting Production Readiness Test CLI');
        
        try {
            await this.parseArguments();
            await this.ensureOutputDirectory();
            await this.startServer();
            await this.runTests();
            await this.generateReport();
            
            console.log('✅ Production readiness tests completed successfully');
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Production readiness tests failed:', error.message);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }

    parseArguments() {
        const args = process.argv.slice(2);
        
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '--timeout':
                    this.config.timeout = parseInt(args[++i]) * 1000;
                    break;
                case '--port':
                    this.port = parseInt(args[++i]);
                    this.testUrl = `http://localhost:${this.port}/production-readiness-test.html`;
                    break;
                case '--output':
                    this.outputDir = args[++i];
                    break;
                case '--format':
                    this.config.exportFormat = args[++i];
                    break;
                case '--core-only':
                    this.config.coreOnly = true;
                    break;
                case '--retries':
                    this.config.retries = parseInt(args[++i]);
                    break;
                case '--help':
                    this.showHelp();
                    process.exit(0);
                    break;
            }
        }
    }

    showHelp() {
        console.log(`
🚀 Production Readiness Test CLI

Usage: node scripts/production-readiness-cli.js [options]

Options:
  --timeout <seconds>    Test timeout in seconds (default: 300)
  --port <number>        Server port (default: 3000)
  --output <directory>   Output directory for test results (default: ./test-results)
  --format <format>      Export format: json, junit, both (default: both)
  --core-only           Run only core tests (Environment, Firebase, Auth, Comments)
  --retries <number>     Number of retries on failure (default: 3)
  --help                Show this help message

Examples:
  node scripts/production-readiness-cli.js
  node scripts/production-readiness-cli.js --core-only --timeout 120
  node scripts/production-readiness-cli.js --format junit --output ./ci-results
        `);
    }

    async ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${this.outputDir}`);
        }
    }

    async startServer() {
        console.log(`🌐 Starting development server on port ${this.port}...`);
        
        return new Promise((resolve, reject) => {
            // Build configuration first
            const buildProcess = spawn('npm', ['run', 'build:config:dev'], {
                stdio: 'pipe',
                cwd: process.cwd()
            });

            buildProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Build configuration failed with code ${code}`));
                    return;
                }

                // Start the server
                this.serverProcess = spawn('npm', ['run', 'dev'], {
                    stdio: 'pipe',
                    cwd: process.cwd(),
                    detached: false
                });

                // Wait for server to be ready
                this.waitForServer()
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    async waitForServer() {
        const maxAttempts = 30;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                await this.makeRequest('http://localhost:' + this.port);
                console.log('✅ Server is ready');
                return;
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    throw new Error('Server failed to start within timeout');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const req = http.get(url, (res) => {
                resolve(res);
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async runTests() {
        console.log('🧪 Installing Playwright for automated testing...');
        
        // Install playwright if needed
        try {
            await this.executeCommand('npx', ['playwright', 'install', 'chromium']);
        } catch (error) {
            console.warn('⚠️ Failed to install Playwright, proceeding with existing installation');
        }

        console.log(`🎭 Running ${this.config.coreOnly ? 'core' : 'all'} production readiness tests...`);
        
        const playwrightScript = this.generatePlaywrightScript();
        const scriptPath = path.join(this.outputDir, 'test-runner.js');
        
        fs.writeFileSync(scriptPath, playwrightScript);
        
        try {
            await this.executeCommand('node', [scriptPath]);
            console.log('✅ All tests completed successfully');
        } catch (error) {
            throw new Error(`Test execution failed: ${error.message}`);
        }
    }

    generatePlaywrightScript() {
        return `
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runTests() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('✅') || msg.text().includes('❌')) {
            console.log(msg.text());
        }
    });
    
    try {
        console.log('🌐 Navigating to test page...');
        await page.goto('${this.testUrl}', { waitUntil: 'networkidle' });
        
        // Wait for test framework to initialize
        await page.waitForFunction(() => window.ProductionReadinessTest, { timeout: 30000 });
        
        console.log('🎭 Enabling headless mode...');
        await page.evaluate(() => window.ProductionReadinessTest.toggleHeadlessMode());
        
        console.log('🚀 Starting ${this.config.coreOnly ? 'core' : 'all'} tests...');
        await page.evaluate(() => ${this.config.coreOnly ? 'window.ProductionReadinessTest.runCoreTests()' : 'window.ProductionReadinessTest.runAllTests()'});
        
        // Wait for tests to complete (check for completion indicator)
        await page.waitForFunction(() => {
            const statusElement = document.getElementById('overall-status');
            return statusElement && (
                statusElement.textContent.includes('All tests passed') ||
                statusElement.textContent.includes('tests passed') ||
                statusElement.textContent.includes('Critical issues found')
            );
        }, { timeout: ${this.config.timeout} });
        
        // Get test results
        const results = await page.evaluate(() => {
            const testCore = window.ProductionReadinessTest.getTestCore();
            return {
                json: testCore.generateReport('json'),
                junit: testCore.generateReport('junit'),
                metrics: {
                    total: parseInt(document.getElementById('total-tests').textContent),
                    passed: parseInt(document.getElementById('passed-tests').textContent),
                    failed: parseInt(document.getElementById('failed-tests').textContent),
                    successRate: document.getElementById('success-rate').textContent
                }
            };
        });
        
        console.log('📊 Test Summary:');
        console.log(\`   Total Tests: \${results.metrics.total}\`);
        console.log(\`   Passed: \${results.metrics.passed}\`);
        console.log(\`   Failed: \${results.metrics.failed}\`);
        console.log(\`   Success Rate: \${results.metrics.successRate}\`);
        
        // Export results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if ('${this.config.exportFormat}' === 'json' || '${this.config.exportFormat}' === 'both') {
            const jsonPath = path.join('${this.outputDir}', \`production-readiness-\${timestamp}.json\`);
            fs.writeFileSync(jsonPath, results.json);
            console.log(\`📥 JSON results exported to: \${jsonPath}\`);
        }
        
        if ('${this.config.exportFormat}' === 'junit' || '${this.config.exportFormat}' === 'both') {
            const junitPath = path.join('${this.outputDir}', \`production-readiness-\${timestamp}.xml\`);
            fs.writeFileSync(junitPath, results.junit);
            console.log(\`📥 JUnit results exported to: \${junitPath}\`);
        }
        
        // Check if tests passed
        const successRate = parseInt(results.metrics.successRate.replace('%', ''));
        const threshold = ${this.config.coreOnly ? '100' : '80'}; // 100% for core, 80% for all tests
        
        if (successRate < threshold) {
            throw new Error(\`Tests failed: \${successRate}% success rate (threshold: \${threshold}%)\`);
        }
        
        console.log(\`✅ All tests passed with \${successRate}% success rate\`);
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runTests().catch(console.error);
        `;
    }

    executeCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                stdio: 'inherit',
                cwd: process.cwd()
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });

            process.on('error', reject);
        });
    }

    async generateReport() {
        console.log('📋 Generating final report...');
        
        // Create a summary report
        const reportPath = path.join(this.outputDir, 'production-readiness-summary.md');
        const timestamp = new Date().toISOString();
        
        const report = `
# Production Readiness Test Report

**Generated:** ${timestamp}  
**Test Type:** ${this.config.coreOnly ? 'Core Tests Only' : 'Comprehensive Test Suite'}  
**Environment:** CI/CD Headless Mode  

## Test Results

Results have been exported to:
- JSON format: \`production-readiness-*.json\`
- JUnit format: \`production-readiness-*.xml\`

## Next Steps

1. **Review detailed results** in the JSON file for comprehensive analysis
2. **Check JUnit XML** for CI/CD pipeline integration
3. **Address any failing tests** before production deployment
4. **Verify accessibility compliance** if accessibility tests were included
5. **Test Web3 functionality** if decentralization features were tested

## Production Readiness Criteria

- ✅ **Core Tests**: Must achieve 100% success rate
- ✅ **Extended Tests**: Must achieve 80%+ success rate
- ✅ **Performance**: Response times within acceptable thresholds
- ✅ **Accessibility**: WCAG 2.1 compliance for inclusive design
- ✅ **Security**: No critical vulnerabilities detected

---

Generated by Commentator Production Readiness Test Suite
        `;

        fs.writeFileSync(reportPath, report.trim());
        console.log(`📋 Summary report generated: ${reportPath}`);
    }

    async cleanup() {
        if (this.serverProcess && !this.serverProcess.killed) {
            console.log('🧹 Cleaning up server process...');
            
            // Kill the entire process group to ensure all child processes are terminated
            try {
                process.kill(-this.serverProcess.pid, 'SIGTERM');
            } catch (error) {
                // Try regular kill if process group kill fails
                try {
                    this.serverProcess.kill('SIGTERM');
                } catch (innerError) {
                    // Force kill if graceful termination fails
                    this.serverProcess.kill('SIGKILL');
                }
            }
            
            // Wait a bit for cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new ProductionReadinessCLI();
    cli.run();
}

export default ProductionReadinessCLI;