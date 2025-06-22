# Debug Logger Panel - Commentator

## Overview

The Commentator Debug Logger is a professional terminal-style debug panel that provides real-time logging, filtering, and debugging capabilities for the Commentator web application.

## Features

### ✨ Core Features
- **Real-time logging** with animated log entry display
- **Multiple log levels**: Info, Success, Warning, Error, Action
- **Terminal-style appearance** with monospace fonts and dark theme
- **Branded styling** matching Commentator's visual identity
- **Draggable and resizable** panel with smooth interactions

### 🔧 Developer Tools
- **Filter by log level** using dropdown menu
- **Search functionality** to find specific log entries
- **Copy all logs** to clipboard for sharing
- **Clear logs** button for cleanup
- **Log count** display showing visible entries

### ⌨️ Keyboard Shortcuts
- **Ctrl + ~** - Toggle panel visibility
- **Escape** - Close panel when visible

### 📱 Responsive Design
- **Mobile-friendly** with responsive layout
- **Touch-optimized** controls for mobile devices
- **Accessible** with proper focus management and ARIA labels

### 🎨 Visual Features
- **Branded colors** using Commentator's blue gradient theme
- **Smooth animations** for log entries and interactions
- **Professional styling** with subtle shadows and effects
- **High contrast** support for better readability

## Usage

### Basic Logging

```javascript
// Basic log levels
window.CommentatorLogger.info('This is an info message', 'CATEGORY');
window.CommentatorLogger.success('Operation completed successfully', 'CATEGORY');
window.CommentatorLogger.warning('This is a warning message', 'CATEGORY');
window.CommentatorLogger.error('This is an error message', 'CATEGORY');

// Action logging with status
window.CommentatorLogger.action('User login attempt', 'success', 'AUTH');
window.CommentatorLogger.action('Failed to save data', 'error', 'DATABASE');
```

### Advanced Logging

```javascript
// Logging with detailed context
window.CommentatorLogger.log('Complex operation', 'info', 'SYSTEM', {
    userId: 123,
    sessionId: 'abc-123',
    metadata: { action: 'test' }
});
```

### Panel Control

```javascript
// Programmatic panel control
window.CommentatorLogger.show();    // Show panel
window.CommentatorLogger.hide();    // Hide panel
window.CommentatorLogger.toggle();  // Toggle visibility
window.CommentatorLogger.clearLogs(); // Clear all logs
```

## Integration

The logger is automatically initialized when included in the page:

1. Include the CSS file:
```html
<link rel="stylesheet" href="css/logger-panel.css">
```

2. Include the JavaScript file:
```html
<script src="js/logger.js"></script>
```

3. The logger is available globally as `window.CommentatorLogger`

## Configuration

### Panel State Persistence
The panel automatically saves its position, size, and state to localStorage:
- Position (x, y coordinates)
- Size (width, height)
- Minimized state

### Log Limits
- Maximum logs stored: 1000 entries
- Older logs are automatically removed when limit is reached
- All filtering and search operations work on the current log set

## Log Categories

The logger supports categorized logging for better organization:

- **INIT** - Application initialization
- **COMPONENTS** - Component loading and lifecycle
- **USER_INTERACTION** - User actions and clicks
- **COMMENTS** - Comment-related operations
- **VALIDATION** - Form and data validation
- **API** - API calls and responses
- **AUTH** - Authentication and authorization
- **DATABASE** - Database operations
- **SYSTEM** - System-level operations
- **HELP** - Help and guidance messages

## Testing

A comprehensive test page is available at `/logger-test.html` which demonstrates:
- All log levels and categories
- Bulk log generation
- Complex object logging
- Panel interaction features
- Responsive behavior

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Accessibility

The debug panel includes:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Reduced motion respect

## Performance

- Efficient DOM updates with batch operations
- Memory management with log limits
- Smooth animations with CSS transforms
- Minimal impact on main application performance

## Development

The logger is built with vanilla JavaScript and CSS for:
- Zero dependencies
- Easy integration
- Minimal bundle size
- Maximum compatibility