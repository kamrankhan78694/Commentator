/**
 * Commentator Debug Logger Core
 *
 * Core logging functionality with event handling, state management,
 * and logging operations separated from UI concerns.
 */

import { LoggerUI } from './logger-ui.js';

class CommentatorLogger {
  constructor() {
    this.logs = [];
    this.isVisible = false;
    this.isDragging = false;
    this.isResizing = false;
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.maxLogs = 1000;

    // Panel state
    this.panelState = {
      x: 50,
      y: 50,
      width: 600,
      height: 400,
      minimized: false,
    };

    // Initialize UI
    this.ui = new LoggerUI(this);
    this.init();
  }

  init() {
    this.loadPanelState();
    this.ui.createPanelHTML();
    this.attachEventListeners();
    this.addKeyboardShortcuts();

    // Log initialization
    this.log('Logger initialized successfully', 'success', 'SYSTEM');
  }

  attachEventListeners() {
    if (!this.ui.panelElement) return;

    // Dragging functionality
    const header = this.ui.panelElement.querySelector('.debug-panel-header');
    header.addEventListener('mousedown', this.startDrag.bind(this));

    // Resizing functionality
    const resizeHandle = this.ui.panelElement.querySelector(
      '.debug-panel-resize-handle'
    );
    resizeHandle.addEventListener('mousedown', this.startResize.bind(this));

    // Control buttons
    const minimizeBtn = this.ui.panelElement.querySelector('.debug-btn-minimize');
    const closeBtn = this.ui.panelElement.querySelector('.debug-btn-close');
    const clearBtn = this.ui.panelElement.querySelector('.debug-btn-clear');
    const copyBtn = this.ui.panelElement.querySelector('.debug-btn-copy');

    minimizeBtn.addEventListener('click', () => this.ui.toggleMinimize());
    closeBtn.addEventListener('click', () => this.hide());
    clearBtn.addEventListener('click', () => this.clearLogs());
    copyBtn.addEventListener('click', () => this.copyAllLogs());

    // Filter and search
    const filterSelect = this.ui.panelElement.querySelector('.debug-filter');
    const searchInput = this.ui.panelElement.querySelector('.debug-search');

    filterSelect.addEventListener('change', this.handleFilterChange.bind(this));
    searchInput.addEventListener('input', this.handleSearchChange.bind(this));

    // Mouse events for dragging and resizing
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Prevent text selection during drag/resize
    this.ui.panelElement.addEventListener('selectstart', (e) => {
      if (this.isDragging || this.isResizing) {
        e.preventDefault();
      }
    });
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Toggle panel with Ctrl+`
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        this.toggle();
      }

      // Hide panel with Escape
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  startDrag(e) {
    if (e.target.closest('.debug-panel-controls')) return;

    this.isDragging = true;
    this.dragStartX = e.clientX - this.panelState.x;
    this.dragStartY = e.clientY - this.panelState.y;
    this.ui.panelElement.classList.add('dragging');
    e.preventDefault();
  }

  startResize(e) {
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.resizeStartWidth = this.panelState.width;
    this.resizeStartHeight = this.panelState.height;
    this.ui.panelElement.classList.add('resizing');
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      this.panelState.x = e.clientX - this.dragStartX;
      this.panelState.y = e.clientY - this.dragStartY;

      // Keep panel within viewport
      this.panelState.x = Math.max(
        0,
        Math.min(this.panelState.x, window.innerWidth - this.panelState.width)
      );
      this.panelState.y = Math.max(
        0,
        Math.min(this.panelState.y, window.innerHeight - 50)
      );

      this.ui.updatePanelPosition();
    }

    if (this.isResizing) {
      const deltaX = e.clientX - this.resizeStartX;
      const deltaY = e.clientY - this.resizeStartY;

      this.panelState.width = Math.max(400, this.resizeStartWidth + deltaX);
      this.panelState.height = Math.max(300, this.resizeStartHeight + deltaY);

      // Keep panel within viewport
      if (this.panelState.x + this.panelState.width > window.innerWidth) {
        this.panelState.width = window.innerWidth - this.panelState.x;
      }
      if (this.panelState.y + this.panelState.height > window.innerHeight) {
        this.panelState.height = window.innerHeight - this.panelState.y;
      }

      this.ui.updatePanelPosition();
    }
  }

  handleMouseUp() {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false;
      this.isResizing = false;
      this.ui.panelElement.classList.remove('dragging', 'resizing');
      this.savePanelState();
    }
  }

  savePanelState() {
    try {
      localStorage.setItem(
        'commentator-debug-panel-state',
        JSON.stringify(this.panelState)
      );
    } catch (e) {
      console.warn('Failed to save panel state:', e);
    }
  }

  loadPanelState() {
    try {
      const saved = localStorage.getItem('commentator-debug-panel-state');
      if (saved) {
        this.panelState = { ...this.panelState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load panel state:', e);
    }
  }

  show() {
    this.ui.show();
  }

  hide() {
    this.ui.hide();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  log(message, level = 'info', category = 'APP', details = null) {
    const timestamp = new Date();
    const logEntry = {
      id: Date.now() + Math.random(),
      message,
      level,
      category,
      details,
      timestamp,
    };

    this.logs.push(logEntry);

    // Limit log history
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.renderLog(logEntry);
    this.ui.updateLogCount();
    this.ui.scrollToBottom();
  }

  // Convenience methods
  info(message, category = 'APP', details = null) {
    this.log(message, 'info', category, details);
  }

  warning(message, category = 'APP', details = null) {
    this.log(message, 'warning', category, details);
  }

  error(message, category = 'APP', details = null) {
    this.log(message, 'error', category, details);
  }

  success(message, category = 'APP', details = null) {
    this.log(message, 'success', category, details);
  }

  action(message, status = 'info', category = 'ACTION', details = null) {
    this.log(message, status, category, details);
  }

  renderLog(logEntry) {
    if (!this.ui.logContainer) return;

    // Remove welcome message if it exists
    const welcomeMessage = this.ui.logContainer.querySelector(
      '.debug-welcome-message'
    );
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    // Check if log should be shown based on current filters
    if (!this.shouldShowLog(logEntry)) {
      return;
    }

    const logElement = document.createElement('div');
    logElement.className = `debug-log-entry level-${logEntry.level}`;

    const timeStr = logEntry.timestamp.toLocaleTimeString();
    const detailsHtml = logEntry.details
      ? `<div class="debug-log-details">${this.ui.escapeHtml(
          typeof logEntry.details === 'object'
            ? JSON.stringify(logEntry.details, null, 2)
            : logEntry.details
        )}</div>`
      : '';

    logElement.innerHTML = `
            <div class="debug-log-header">
                <span class="debug-log-time">${timeStr}</span>
                <div>
                    <span class="debug-log-level level-${logEntry.level}">${logEntry.level}</span>
                    <span class="debug-log-category">${logEntry.category}</span>
                </div>
            </div>
            <div class="debug-log-message">${this.ui.escapeHtml(logEntry.message)}</div>
            ${detailsHtml}
        `;

    this.ui.logContainer.appendChild(logElement);

    // Animate log entry
    setTimeout(() => {
      logElement.classList.add('visible');
    }, 10);
  }

  shouldShowLog(logEntry) {
    // Filter by level
    if (this.currentFilter !== 'all' && logEntry.level !== this.currentFilter) {
      return false;
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchableText = `${logEntry.message} ${logEntry.category} ${logEntry.level}`.toLowerCase();
      if (!searchableText.includes(this.searchTerm.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  refreshLogDisplay() {
    if (!this.ui.logContainer) return;

    // Clear current display
    this.ui.logContainer.innerHTML = '';

    // Re-render all logs that match current filters
    this.logs.forEach((log) => {
      if (this.shouldShowLog(log)) {
        this.renderLog(log);
      }
    });

    if (this.ui.logContainer.children.length === 0) {
      this.ui.logContainer.innerHTML = `
                <div class="debug-welcome-message">
                    <div class="debug-welcome-icon">🔍</div>
                    <h3>No logs match current filters</h3>
                    <p>Try adjusting your filter settings or search terms.</p>
                </div>
            `;
    }
  }

  handleFilterChange(e) {
    this.currentFilter = e.target.value;
    this.refreshLogDisplay();
    this.ui.updateLogCount();
  }

  handleSearchChange(e) {
    this.searchTerm = e.target.value;
    this.refreshLogDisplay();
    this.ui.updateLogCount();
  }

  clearLogs() {
    this.logs = [];
    this.ui.logContainer.innerHTML = '';
    this.ui.updateLogCount();
    this.log('Logs cleared', 'info', 'PANEL');
  }

  copyAllLogs() {
    const visibleLogs = this.logs.filter((log) => this.shouldShowLog(log));
    const logText = visibleLogs
      .map((log) => {
        const time = log.timestamp.toLocaleTimeString();
        return `[${time}] ${log.level.toUpperCase()} [${log.category}] ${log.message}${
          log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''
        }`;
      })
      .join('\n');

    if (logText) {
      navigator.clipboard
        .writeText(logText)
        .then(() => {
          this.success('Logs copied to clipboard', 'PANEL');
        })
        .catch(() => {
          this.error('Failed to copy logs to clipboard', 'PANEL');
        });
    } else {
      this.warning('No logs to copy', 'PANEL');
    }
  }
}

// Create global logger instance
window.CommentatorLogger = new CommentatorLogger();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommentatorLogger;
}