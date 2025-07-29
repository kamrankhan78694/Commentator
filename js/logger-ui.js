/**
 * Commentator Debug Logger UI Components
 *
 * Handles UI creation, styling, and visual interactions for the debug panel.
 * This module is focused on the presentation layer of the logger.
 */

import { LOGGER_STYLES } from './logger-styles.js';

export class LoggerUI {
  constructor(logger) {
    this.logger = logger;
    this.panelElement = null;
    this.logContainer = null;
  }

  /**
   * Create the debug panel HTML structure
   */
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
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="success">Success</option>
                        </select>
                        <input type="text" class="debug-search" placeholder="Search logs..." />
                        <button class="debug-btn debug-btn-clear" title="Clear All Logs">
                            <i data-feather="trash-2"></i>
                            Clear
                        </button>
                    </div>
                    <div class="debug-toolbar-right">
                        <button class="debug-btn debug-btn-copy" title="Copy All Logs">
                            <i data-feather="copy"></i>
                            Copy
                        </button>
                        <span class="debug-log-count">0 logs</span>
                    </div>
                </div>

                <div class="debug-panel-content">
                    <div class="debug-logs-container" id="debug-logs-container">
                        <div class="debug-welcome-message">
                            <div class="debug-welcome-icon">🗨️</div>
                            <h3>Commentator Debug Console</h3>
                            <p>Debug information will appear here. Use Ctrl+~ to toggle this panel.</p>
                        </div>
                    </div>
                </div>

                <div class="debug-panel-resize-handle" title="Drag to resize">
                    <i data-feather="corner-down-right"></i>
                </div>
            </div>

            <style>
                ${LOGGER_STYLES}
            </style>
        `;

    // Insert the panel into the document
    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // Store references
    this.panelElement = document.getElementById('commentator-debug-panel');
    this.logContainer = document.getElementById('debug-logs-container');

    // Update panel position
    this.updatePanelPosition();

    // Replace feather icons if available
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  /**
   * Update panel position and size
   */
  updatePanelPosition() {
    if (!this.panelElement) return;

    this.panelElement.style.left = `${this.logger.panelState.x}px`;
    this.panelElement.style.top = `${this.logger.panelState.y}px`;
    this.panelElement.style.width = `${this.logger.panelState.width}px`;
    this.panelElement.style.height = `${this.logger.panelState.height}px`;
  }

  /**
   * Show the debug panel
   */
  show() {
    if (!this.panelElement) return;

    this.logger.isVisible = true;
    this.panelElement.classList.remove('hidden');
    this.panelElement.classList.add('visible');

    // Focus search input after showing
    setTimeout(() => {
      const searchInput = this.panelElement.querySelector('.debug-search');
      if (searchInput) searchInput.focus();
    }, 100);

    this.logger.log('Debug panel opened', 'info', 'PANEL');
  }

  /**
   * Hide the debug panel
   */
  hide() {
    if (!this.panelElement) return;

    this.logger.isVisible = false;
    this.panelElement.classList.remove('visible');
    this.panelElement.classList.add('hidden');

    this.logger.log('Debug panel closed', 'info', 'PANEL');
  }

  /**
   * Toggle minimize state
   */
  toggleMinimize() {
    this.logger.panelState.minimized = !this.logger.panelState.minimized;
    this.panelElement.classList.toggle('minimized', this.logger.panelState.minimized);
    this.logger.savePanelState();
  }

  /**
   * Update log count display
   */
  updateLogCount() {
    const countElement = this.panelElement?.querySelector('.debug-log-count');
    if (countElement) {
      const visibleLogs = this.logger.logs.filter((log) =>
        this.logger.shouldShowLog(log)
      );
      countElement.textContent = `${visibleLogs.length} logs`;
    }
  }

  /**
   * Scroll to bottom of logs
   */
  scrollToBottom() {
    if (this.logContainer) {
      setTimeout(() => {
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
      }, 10);
    }
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}