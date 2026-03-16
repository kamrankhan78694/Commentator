/**
 * Logger UI Styles
 *
 * CSS styles for the Commentator debug logger panel.
 * Separated to maintain 500-line file limit.
 */

export const LOGGER_STYLES = `
.commentator-debug-panel {
    position: fixed;
    z-index: 999999;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #e0e0e0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: all 0.3s ease;
    min-width: 400px;
    min-height: 300px;
}

.commentator-debug-panel.hidden {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
    pointer-events: none;
}

.commentator-debug-panel.visible {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: all;
}

.commentator-debug-panel.minimized .debug-panel-content,
.commentator-debug-panel.minimized .debug-panel-toolbar,
.commentator-debug-panel.minimized .debug-panel-resize-handle {
    display: none;
}

.commentator-debug-panel.dragging {
    user-select: none;
    cursor: move;
}

.commentator-debug-panel.resizing {
    user-select: none;
}

.debug-panel-header {
    background: linear-gradient(135deg, #2d5aa0 0%, #1e3d72 100%);
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    user-select: none;
    border-bottom: 1px solid #333;
}

.debug-panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: white;
}

.debug-logo {
    font-size: 16px;
}

.debug-panel-controls {
    display: flex;
    gap: 4px;
}

.debug-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    transition: all 0.2s ease;
}

.debug-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
}

.debug-btn i {
    width: 12px;
    height: 12px;
}

.debug-panel-toolbar {
    background: #2a2a2a;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
    gap: 12px;
}

.debug-toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.debug-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.debug-filter {
    background: #1a1a1a;
    border: 1px solid #444;
    color: #e0e0e0;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    min-width: 100px;
}

.debug-search {
    background: #1a1a1a;
    border: 1px solid #444;
    color: #e0e0e0;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    flex: 1;
    max-width: 200px;
}

.debug-search:focus,
.debug-filter:focus {
    outline: none;
    border-color: #2d5aa0;
    box-shadow: 0 0 0 1px rgba(45, 90, 160, 0.3);
}

.debug-log-count {
    color: #888;
    font-size: 11px;
    white-space: nowrap;
}

.debug-panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100% - 80px);
    overflow: hidden;
}

.debug-logs-container {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #1a1a1a;
}

.debug-logs-container::-webkit-scrollbar {
    width: 8px;
}

.debug-logs-container::-webkit-scrollbar-track {
    background: #2a2a2a;
}

.debug-logs-container::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
}

.debug-logs-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.debug-welcome-message {
    text-align: center;
    padding: 40px 20px;
    color: #888;
    user-select: none;
}

.debug-welcome-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.debug-welcome-message h3 {
    margin: 0 0 8px 0;
    color: #2d5aa0;
    font-size: 18px;
}

.debug-welcome-message p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
}

.debug-log-entry {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 3px solid #444;
    background: rgba(255, 255, 255, 0.02);
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    word-wrap: break-word;
}

.debug-log-entry.visible {
    opacity: 1;
    transform: translateY(0);
}

.debug-log-entry.level-info {
    border-left-color: #2196f3;
}

.debug-log-entry.level-warning {
    border-left-color: #ff9800;
    background: rgba(255, 152, 0, 0.05);
}

.debug-log-entry.level-error {
    border-left-color: #f44336;
    background: rgba(244, 67, 54, 0.05);
}

.debug-log-entry.level-success {
    border-left-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
}

.debug-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 11px;
}

.debug-log-time {
    color: #888;
    font-family: monospace;
}

.debug-log-level {
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 10px;
}

.debug-log-level.level-info {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
}

.debug-log-level.level-warning {
    background: rgba(255, 152, 0, 0.2);
    color: #ff9800;
}

.debug-log-level.level-error {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.debug-log-level.level-success {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.debug-log-category {
    background: rgba(255, 255, 255, 0.1);
    color: #ccc;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
}

.debug-log-message {
    color: #e0e0e0;
    line-height: 1.4;
    margin-bottom: 4px;
}

.debug-log-details {
    background: rgba(0, 0, 0, 0.3);
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
    font-family: monospace;
    font-size: 11px;
    color: #ccc;
    border: 1px solid #333;
    overflow-x: auto;
}

.debug-panel-resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nw-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    background: linear-gradient(-45deg, transparent 0%, transparent 40%, #333 40%, #333 60%, transparent 60%);
}

.debug-panel-resize-handle:hover {
    color: #999;
}

.debug-panel-resize-handle i {
    width: 12px;
    height: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .commentator-debug-panel {
        min-width: 90vw;
        min-height: 50vh;
    }

    .debug-toolbar-left {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
    }

    .debug-search {
        max-width: none;
    }
}
`;
