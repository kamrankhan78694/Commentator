/**
 * Commentator Debug Logger
 *
 * A terminal-style debug panel for real-time logging with filtering, search,
 * and developer-friendly features. Designed to match Commentator's branding.
 */

class CommentatorLogger {
  constructor() {
    this.logs = [];
    this.isVisible = false;
    this.isDragging = false;
    this.isResizing = false;
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.panelElement = null;
    this.logContainer = null;
    this.maxLogs = 1000;

    // Panel state
    this.panelState = {
      x: 50,
      y: 50,
      width: 600,
      height: 400,
      minimized: false,
    };

    this.init();
  }

  init() {
    this.loadPanelState();
    this.createPanelHTML();
    this.attachEventListeners();
    this.addKeyboardShortcuts();

    // Log initialization
    this.log('Logger initialized successfully', 'success', 'SYSTEM');
  }

  createPanelHTML() {
    // Create the debug panel HTML structure
    const panelHTML = `
            <div id="commentator-debug-panel" class="commentator-debug-panel hidden">
                <div class="debug-panel-header">
                    <div class="debug-panel-title">
                        <span class="debug-logo">🗨️</span>
                        <span>Commentator Debug Console</span>
                    </div>
                    <div class="debug-panel-controls">
                        <button class="debug-btn debug-btn-minimize" title="Minimize Panel">
                            <i data-feather="minus"></i>
                        </button>
                        <button class="debug-btn debug-btn-close" title="Close Panel (Ctrl+~)">
                            <i data-feather="x"></i>
                        </button>
                    </div>
                </div>
                
                <div class="debug-panel-toolbar">
                    <div class="debug-toolbar-left">
                        <select class="debug-filter">
                            <option value="all">All Logs</option>
                            <option value="info">Info</option>
                            <option value="warning">Warnings</option>
                            <option value="error">Errors</option>
                            <option value="success">Success</option>
                            <option value="action">Actions</option>
                        </select>
                        
                        <input type="text" class="debug-search" placeholder="Search logs..." />
                        
                        <button class="debug-btn debug-btn-clear" title="Clear All Logs">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                    
                    <div class="debug-toolbar-right">
                        <button class="debug-btn debug-btn-copy" title="Copy All Logs">
                            <i data-feather="copy"></i>
                        </button>
                        
                        <span class="debug-log-count">0 logs</span>
                    </div>
                </div>
                
                <div class="debug-panel-content">
                    <div class="debug-logs-container" id="debug-logs-container">
                        <div class="debug-welcome-message">
                            <p>🚀 Debug panel ready</p>
                            <p>Press <kbd>Ctrl + ~</kbd> to toggle visibility</p>
                        </div>
                    </div>
                </div>
                
                <div class="debug-panel-resize-handle"></div>
            </div>
        `;

    // Add the panel to the body
    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // Store references
    this.panelElement = document.getElementById('commentator-debug-panel');
    this.logContainer = document.getElementById('debug-logs-container');

    // Set initial position and size
    this.updatePanelPosition();

    // Initialize feather icons for the panel
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  attachEventListeners() {
    if (!this.panelElement) return;

    // Header drag functionality
    const header = this.panelElement.querySelector('.debug-panel-header');
    header.addEventListener('mousedown', this.startDrag.bind(this));

    // Resize handle
    const resizeHandle = this.panelElement.querySelector(
      '.debug-panel-resize-handle'
    );
    resizeHandle.addEventListener('mousedown', this.startResize.bind(this));

    // Control buttons
    this.panelElement
      .querySelector('.debug-btn-close')
      .addEventListener('click', () => this.hide());
    this.panelElement
      .querySelector('.debug-btn-minimize')
      .addEventListener('click', this.toggleMinimize.bind(this));
    this.panelElement
      .querySelector('.debug-btn-clear')
      .addEventListener('click', this.clearLogs.bind(this));
    this.panelElement
      .querySelector('.debug-btn-copy')
      .addEventListener('click', this.copyAllLogs.bind(this));

    // Filter and search
    this.panelElement
      .querySelector('.debug-filter')
      .addEventListener('change', this.handleFilterChange.bind(this));
    this.panelElement
      .querySelector('.debug-search')
      .addEventListener('input', this.handleSearchChange.bind(this));

    // Global mouse events for drag and resize
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Prevent panel from being selectable during drag
    this.panelElement.addEventListener('selectstart', (e) => {
      if (this.isDragging || this.isResizing) {
        e.preventDefault();
      }
    });
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + ~ (tilde) to toggle panel
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        this.toggle();
      }

      // Escape to close panel
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  // Drag functionality
  startDrag(e) {
    if (e.target.closest('.debug-panel-controls')) return;

    this.isDragging = true;
    this.dragStartX = e.clientX - this.panelState.x;
    this.dragStartY = e.clientY - this.panelState.y;
    this.panelElement.classList.add('dragging');
    e.preventDefault();
  }

  // Resize functionality
  startResize(e) {
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.resizeStartWidth = this.panelState.width;
    this.resizeStartHeight = this.panelState.height;
    this.panelElement.classList.add('resizing');
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

      this.updatePanelPosition();
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

      this.updatePanelPosition();
    }
  }

  handleMouseUp() {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false;
      this.isResizing = false;
      this.panelElement.classList.remove('dragging', 'resizing');
      this.savePanelState();
    }
  }

  updatePanelPosition() {
    if (!this.panelElement) return;

    this.panelElement.style.left = `${this.panelState.x}px`;
    this.panelElement.style.top = `${this.panelState.y}px`;
    this.panelElement.style.width = `${this.panelState.width}px`;
    this.panelElement.style.height = `${this.panelState.height}px`;
  }

  // Panel state management
  savePanelState() {
    try {
      localStorage.setItem(
        'commentator-debug-panel-state',
        JSON.stringify(this.panelState)
      );
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  loadPanelState() {
    try {
      const saved = localStorage.getItem('commentator-debug-panel-state');
      if (saved) {
        this.panelState = { ...this.panelState, ...JSON.parse(saved) };
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Panel visibility
  show() {
    if (!this.panelElement) return;

    this.isVisible = true;
    this.panelElement.classList.remove('hidden');
    this.panelElement.classList.add('visible');

    // Focus search input for immediate use
    setTimeout(() => {
      const searchInput = this.panelElement.querySelector('.debug-search');
      if (searchInput) searchInput.focus();
    }, 100);

    this.log('Debug panel opened', 'info', 'PANEL');
  }

  hide() {
    if (!this.panelElement) return;

    this.isVisible = false;
    this.panelElement.classList.remove('visible');
    this.panelElement.classList.add('hidden');

    this.log('Debug panel closed', 'info', 'PANEL');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  toggleMinimize() {
    this.panelState.minimized = !this.panelState.minimized;
    this.panelElement.classList.toggle('minimized', this.panelState.minimized);
    this.savePanelState();
  }

  // Logging methods
  log(message, level = 'info', category = 'APP', details = null) {
    const timestamp = new Date();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      level,
      category,
      details,
    };

    this.logs.push(logEntry);

    // Limit log history
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.renderLog(logEntry);
    this.updateLogCount();
    this.scrollToBottom();
  }

  // Convenience methods for different log levels
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
    if (!this.logContainer) return;

    // Remove welcome message if it exists
    const welcomeMessage = this.logContainer.querySelector(
      '.debug-welcome-message'
    );
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    // Check if log should be shown based on current filter and search
    if (!this.shouldShowLog(logEntry)) {
      return;
    }

    const logElement = document.createElement('div');
    logElement.className = `debug-log-entry debug-log-${logEntry.level}`;
    logElement.dataset.id = logEntry.id;
    logElement.dataset.level = logEntry.level;
    logElement.dataset.category = logEntry.category;

    const timeStr = logEntry.timestamp.toLocaleTimeString();

    logElement.innerHTML = `
            <div class="debug-log-header">
                <span class="debug-log-time">${timeStr}</span>
                <span class="debug-log-level">${logEntry.level.toUpperCase()}</span>
                <span class="debug-log-category">${logEntry.category}</span>
            </div>
            <div class="debug-log-message">${this.escapeHtml(logEntry.message)}</div>
            ${logEntry.details ? `<div class="debug-log-details">${this.escapeHtml(JSON.stringify(logEntry.details, null, 2))}</div>` : ''}
        `;

    this.logContainer.appendChild(logElement);

    // Animate the new log entry
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
      const searchableText =
        `${logEntry.message} ${logEntry.category} ${logEntry.level}`.toLowerCase();
      if (!searchableText.includes(this.searchTerm.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  refreshLogDisplay() {
    if (!this.logContainer) return;

    // Clear current display
    this.logContainer.innerHTML = '';

    // Re-render all logs that match current filter
    this.logs.forEach((log) => {
      if (this.shouldShowLog(log)) {
        this.renderLog(log);
      }
    });

    if (this.logContainer.children.length === 0) {
      this.logContainer.innerHTML =
        '<div class="debug-no-logs">No logs match current filter</div>';
    }
  }

  handleFilterChange(e) {
    this.currentFilter = e.target.value;
    this.refreshLogDisplay();
    this.updateLogCount();
  }

  handleSearchChange(e) {
    this.searchTerm = e.target.value;
    this.refreshLogDisplay();
    this.updateLogCount();
  }

  updateLogCount() {
    const countElement = this.panelElement?.querySelector('.debug-log-count');
    if (countElement) {
      const visibleLogs = this.logs.filter((log) =>
        this.shouldShowLog(log)
      ).length;
      countElement.textContent = `${visibleLogs} log${visibleLogs !== 1 ? 's' : ''}`;
    }
  }

  clearLogs() {
    this.logs = [];
    this.logContainer.innerHTML =
      '<div class="debug-welcome-message"><p>🧹 Logs cleared</p></div>';
    this.updateLogCount();
    this.log('Logs cleared', 'info', 'PANEL');
  }

  copyAllLogs() {
    const visibleLogs = this.logs.filter((log) => this.shouldShowLog(log));
    const logText = visibleLogs
      .map((log) => {
        const time = log.timestamp.toLocaleTimeString();
        return `[${time}] ${log.level.toUpperCase()} [${log.category}] ${log.message}${log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''}`;
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

  scrollToBottom() {
    if (this.logContainer) {
      setTimeout(() => {
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
      }, 10);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global logger instance
window.CommentatorLogger = new CommentatorLogger();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommentatorLogger;
}
