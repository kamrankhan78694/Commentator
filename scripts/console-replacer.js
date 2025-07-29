#!/usr/bin/env node

/**
 * Console Statement Replacement Utility
 * 
 * This utility helps identify and replace console statements with production-safe alternatives
 * in the Commentator codebase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConsoleReplacer {
  constructor() {
    this.consolePatterns = [
      /console\.log\(/g,
      /console\.warn\(/g,
      /console\.error\(/g,
      /console\.info\(/g,
      /console\.debug\(/g
    ];
    
    this.replacements = {
      'console.log(': 'this.safeConsole.log(',
      'console.warn(': 'this.safeConsole.warn(',
      'console.error(': 'this.safeConsole.error(',
      'console.info(': 'this.safeConsole.info(',
      'console.debug(': 'this.safeConsole.debug('
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const consoleStatements = [];

    lines.forEach((line, index) => {
      this.consolePatterns.forEach(pattern => {
        if (pattern.test(line)) {
          consoleStatements.push({
            line: index + 1,
            content: line.trim(),
            type: this.getConsoleType(line)
          });
        }
      });
    });

    return {
      filePath,
      totalLines: lines.length,
      consoleCount: consoleStatements.length,
      statements: consoleStatements
    };
  }

  getConsoleType(line) {
    if (line.includes('console.log')) return 'log';
    if (line.includes('console.warn')) return 'warn';
    if (line.includes('console.error')) return 'error';
    if (line.includes('console.info')) return 'info';
    if (line.includes('console.debug')) return 'debug';
    return 'unknown';
  }

  generateSafeWrapper(statements) {
    const hasLog = statements.some(s => s.type === 'log');
    const hasWarn = statements.some(s => s.type === 'warn');
    const hasError = statements.some(s => s.type === 'error');
    const hasInfo = statements.some(s => s.type === 'info');
    const hasDebug = statements.some(s => s.type === 'debug');

    return `
  // Production-safe console wrapper for this module
  get safeConsole() {
    if (window.CommentatorConsole) {
      return window.CommentatorConsole;
    }
    
    // Fallback console wrapper
    return {
      ${hasLog ? 'log: (...args) => window.location.hostname === "localhost" ? console.log(...args) : void 0,' : ''}
      ${hasWarn ? 'warn: (...args) => window.location.hostname === "localhost" ? console.warn(...args) : void 0,' : ''}
      ${hasError ? 'error: (...args) => console.error(...args),' : ''}
      ${hasInfo ? 'info: (...args) => window.location.hostname === "localhost" ? console.info(...args) : void 0,' : ''}
      ${hasDebug ? 'debug: (...args) => window.location.hostname === "localhost" ? console.debug(...args) : void 0,' : ''}
    };
  }`;
  }

  analyzeProject() {
    const jsDir = path.join(__dirname, '../js');
    const jsFiles = fs.readdirSync(jsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(jsDir, file));

    const analysis = {
      totalFiles: jsFiles.length,
      totalConsoleStatements: 0,
      files: []
    };

    jsFiles.forEach(file => {
      const fileAnalysis = this.analyzeFile(file);
      analysis.files.push(fileAnalysis);
      analysis.totalConsoleStatements += fileAnalysis.consoleCount;
    });

    return analysis;
  }

  generateReport() {
    const analysis = this.analyzeProject();
    
    console.log('🔍 Console Statement Analysis Report');
    console.log('=====================================');
    console.log(`📁 Files analyzed: ${analysis.totalFiles}`);
    console.log(`🗣️  Total console statements: ${analysis.totalConsoleStatements}`);
    console.log('');

    analysis.files.forEach(file => {
      if (file.consoleCount > 0) {
        console.log(`📄 ${path.basename(file.filePath)}: ${file.consoleCount} statements`);
        
        file.statements.forEach(stmt => {
          console.log(`   Line ${stmt.line}: ${stmt.content}`);
        });
        console.log('');
      }
    });

    // Generate recommendations
    console.log('💡 Recommendations:');
    console.log('-------------------');
    
    const criticalFiles = analysis.files.filter(f => f.consoleCount > 20);
    if (criticalFiles.length > 0) {
      console.log('🚨 Files with high console usage (>20 statements):');
      criticalFiles.forEach(f => {
        console.log(`   - ${path.basename(f.filePath)}: ${f.consoleCount} statements`);
      });
    }

    const moderateFiles = analysis.files.filter(f => f.consoleCount > 5 && f.consoleCount <= 20);
    if (moderateFiles.length > 0) {
      console.log('⚠️  Files with moderate console usage (5-20 statements):');
      moderateFiles.forEach(f => {
        console.log(`   - ${path.basename(f.filePath)}: ${f.consoleCount} statements`);
      });
    }

    return analysis;
  }

  generateMigrationPlan() {
    const analysis = this.analyzeProject();
    
    console.log('📋 Console Statement Migration Plan');
    console.log('===================================');
    
    // Priority-based approach
    const phases = [
      {
        name: 'Phase 1: Critical Error Handling',
        files: analysis.files.filter(f => 
          f.statements.some(s => s.type === 'error') && f.consoleCount > 10
        ),
        priority: 'High'
      },
      {
        name: 'Phase 2: High-Volume Logging',
        files: analysis.files.filter(f => 
          f.consoleCount > 20
        ),
        priority: 'High'
      },
      {
        name: 'Phase 3: Moderate Usage',
        files: analysis.files.filter(f => 
          f.consoleCount >= 5 && f.consoleCount <= 20
        ),
        priority: 'Medium'
      },
      {
        name: 'Phase 4: Low Usage',
        files: analysis.files.filter(f => 
          f.consoleCount > 0 && f.consoleCount < 5
        ),
        priority: 'Low'
      }
    ];

    phases.forEach((phase, index) => {
      if (phase.files.length > 0) {
        console.log(`\n${index + 1}. ${phase.name} (${phase.priority} Priority)`);
        console.log(`   Files: ${phase.files.length}`);
        console.log(`   Total statements: ${phase.files.reduce((sum, f) => sum + f.consoleCount, 0)}`);
        
        phase.files.forEach(f => {
          console.log(`   - ${path.basename(f.filePath)}: ${f.consoleCount} statements`);
        });
      }
    });

    return phases;
  }
}

// CLI Interface
function main() {
  const replacer = new ConsoleReplacer();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  switch (command) {
    case 'analyze':
    case 'report':
      replacer.generateReport();
      break;
      
    case 'plan':
      replacer.generateMigrationPlan();
      break;
      
    case 'help':
      console.log('Console Statement Replacement Utility');
      console.log('=====================================');
      console.log('Commands:');
      console.log('  report  - Generate analysis report (default)');
      console.log('  plan    - Generate migration plan');
      console.log('  help    - Show this help message');
      break;
      
    default:
      console.log('Unknown command. Use "help" for available commands.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ConsoleReplacer;