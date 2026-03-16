/**
 * Commentator Debug Logger
 *
 * Compatibility layer that imports the modularized logger components.
 * This maintains backward compatibility while enforcing the 500-line limit.
 */

// Import the core logger functionality (maintains global instance)
import './logger-core.js';

// Export for module usage (the global instance is created in logger-core.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.CommentatorLogger;
}
