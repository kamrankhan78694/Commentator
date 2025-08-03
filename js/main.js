/**
 * Commentator - Main Application Coordinator
 *
 * This file coordinates all the modular components of the Commentator application.
 * It handles initialization, module loading, and provides a clean entry point.
 *
 * Modules:
 * - Navigation: URL handling, breadcrumbs, smooth scrolling
 * - Forms: Email validation, notifications, accessibility
 * - UI Interactions: Mobile menu, animations, tooltips
 * - Comments: Comment system functionality
 * - Comment Display: Comment rendering and formatting
 * - Components: Header/footer loading
 * - Web3: Wallet integration and blockchain features
 *
 * @author Commentator Team
 * @version 2.0.0 - Modularized Architecture
 */

// Import all modules
import {
  getBaseUrl,
  initSmoothScrolling,
  initNavigationHighlight,
  loadBreadcrumb,
  loadNavigationSchema,
  initKeyboardNavigation,
  isValidUrl,
} from './navigation.js';
import {
  initNewsletterForm,
  isValidEmail,
  showNotification,
  validateAccessibility,
  initFormStyles,
} from './forms.js';
import { initAllUIInteractions } from './ui-interactions.js';
import {
  initCommentInterface,
  loadCommentsForUrl,
  submitComment,
} from './comments.js';
import {
  displayComments,
  formatTimestamp,
  displayLocalComment,
  initCommentStyles,
} from './comment-display.js';
import { initComponents } from './components.js';
import {
  initWeb3,
  connectWallet,
  disconnectWallet,
  updateWalletUI,
  initWeb3Styles,
} from './web3.js';

/**
 * Global state for session management
 */
let currentSession = null;

/**
 * Wait for environment configuration to be available
 */
async function waitForEnvironmentConfig() {
  return new Promise((resolve) => {
    const checkConfig = () => {
      if (typeof window.EnvironmentConfig !== 'undefined') {
        resolve(window.EnvironmentConfig);
      } else {
        setTimeout(checkConfig, 100);
      }
    };
    checkConfig();
  });
}

/**
 * Wait for Firebase service to be available
 */
async function waitForFirebaseService() {
  return new Promise((resolve) => {
    const checkService = () => {
      if (typeof window.FirebaseService !== 'undefined') {
        resolve(window.FirebaseService);
      } else {
        setTimeout(checkService, 100);
      }
    };
    checkService();
  });
}

/**
 * Initialize Firebase authentication
 */
async function initFirebaseAuth() {
  try {
    console.log('🔥 Initializing Firebase authentication...');

    // Check if Firebase service is available with timeout
    let firebaseCheckCount = 0;
    // Limit to 5 attempts to prevent an infinite loop while allowing reasonable retries
    const maxFirebaseChecks = 5;

    while (
      typeof window.FirebaseService === 'undefined' &&
      firebaseCheckCount < maxFirebaseChecks
    ) {
      console.warn(
        `⚠️ Firebase service not available, attempt ${firebaseCheckCount + 1}/${maxFirebaseChecks}...`
      );
      updateUserStatus('🔄 Waiting for Firebase...');

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (firebaseCheckCount + 1))
      );
      firebaseCheckCount++;
    }

    if (typeof window.FirebaseService === 'undefined') {
      console.warn(
        '⚠️ Firebase service unavailable after maximum attempts. Continuing with local functionality.'
      );
      updateUserStatus('⚠️ Firebase unavailable - using local mode');
      enableBasicFunctionality();
      return null;
    }

    console.log('✅ Firebase service found, initializing authentication...');
    updateUserStatus('🔄 Authenticating...');

    const authTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Authentication timeout')), 15000);
    });

    const authPromise = window.FirebaseService.initAuth();
    const user = await Promise.race([authPromise, authTimeout]);

    if (user) {
      console.log('✅ Firebase authentication successful:', user.uid);
      updateUserStatus('✅ Connected anonymously');

      const submitBtn = document.getElementById('submit-comment-btn');
      if (submitBtn) {
        submitBtn.disabled = false;
        console.log('✅ Submit button enabled');
      }

      const isAuth = window.FirebaseService.isUserAuthenticated();
      console.log('🔐 Authentication verification:', isAuth);

      if (!isAuth) {
        console.error('❌ Authentication verification failed');
        updateUserStatus('❌ Auth verification failed');
        return;
      }

      try {
        console.log('📝 Creating user session...');
        currentSession = await window.FirebaseService.createSession({
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: Date.now(),
        });

        console.log('✅ Session created:', currentSession);

        setInterval(() => {
          if (currentSession && window.FirebaseService.isUserAuthenticated()) {
            window.FirebaseService.updateSessionActivity(currentSession);
          }
        }, 30000);

        console.log('🎉 Firebase authentication and session setup complete');
      } catch (sessionError) {
        console.warn(
          '⚠️ Session creation failed, but authentication succeeded:',
          sessionError
        );
      }
    } else {
      console.error('❌ Firebase authentication failed - no user returned');
      updateUserStatus('❌ Authentication failed');

      const submitBtn = document.getElementById('submit-comment-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase auth:', error);
    updateUserStatus('❌ Connection error');

    const submitBtn = document.getElementById('submit-comment-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Firebase auth error: ${error.message}`,
        'FIREBASE',
        error
      );
    }
  }
}

/**
 * Update user status display
 * @param {string} status - Status message to display
 */
function updateUserStatus(status) {
  const userStatus = document.getElementById('user-status');
  if (userStatus) {
    userStatus.textContent = status;
  }
}

/**
 * Initialize debug help button functionality
 */
function initDebugHelpButton() {
  const debugBtn = document.getElementById('debug-help-btn');
  if (debugBtn) {
    debugBtn.addEventListener('click', () => {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          'Debug help button clicked',
          'info',
          'DEBUG'
        );
      }
      showNotification(
        'Debug help clicked! Check the console for application state.',
        'info'
      );
    });
  }
}

/**
 * Enable basic functionality without Firebase
 */
function enableBasicFunctionality() {
  const submitBtn = document.getElementById('submit-comment-btn');
  const loadBtn = document.getElementById('load-comments-btn');

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Comment (Local)';
  }

  if (loadBtn) {
    loadBtn.disabled = false;
  }

  // Set up local comment submission
  window.submitCommentLocal = function (
    url,
    comment,
    commentsSection,
    commentTextarea
  ) {
    const localComment = {
      author: 'Anonymous',
      text: comment,
      timestamp: formatTimestamp(Date.now()),
      votes: 0,
      id: Math.random().toString(36).substr(2, 9),
    };

    displayLocalComment(localComment, commentsSection);
    commentTextarea.value = '';
    showNotification('Comment added locally! 🏠', 'success');
  };

  // Set up local comment loading
  window.loadCommentsLocal = function (url, commentsSection) {
    commentsSection.innerHTML = `
      <div class="no-comments">
        <p>🏠 Local mode: No comments stored locally for this URL.</p>
        <p>Submit a comment to see it appear here!</p>
      </div>
    `;
    showNotification(
      'Local mode active - comments stored in browser only',
      'info'
    );
  };

  console.log('✅ Basic functionality enabled - buttons should now work');
}

/**
 * Make key functions globally available for backwards compatibility
 */
function setupGlobalAPI() {
  // Navigation functions
  window.getBaseUrl = getBaseUrl;
  window.isValidUrl = isValidUrl;

  // Forms functions
  window.showNotification = showNotification;
  window.isValidEmail = isValidEmail;

  // Comments functions
  window.loadCommentsForUrl = loadCommentsForUrl;
  window.submitComment = submitComment;
  window.displayComments = displayComments;
  window.formatTimestamp = formatTimestamp;

  // Web3 functions
  window.connectWallet = connectWallet;
  window.disconnectWallet = disconnectWallet;
  window.updateWalletUI = updateWalletUI;

  // Utility functions
  window.updateUserStatus = updateUserStatus;
}

/**
 * Initialize all application modules
 */
async function initializeApp() {
  try {
    console.log('🗨️ Commentator interface initialized (v2.0 - Modular)');

    // Set up global API first
    setupGlobalAPI();

    // Log application initialization
    if (window.CommentatorLogger) {
      window.CommentatorLogger.info('Application initializing...', 'INIT');
      window.CommentatorLogger.action(
        'Loading environment configuration',
        'info',
        'INIT'
      );
    }

    // Wait for environment configuration
    console.log('Waiting for environment configuration...');
    await waitForEnvironmentConfig();
    console.log('Environment configuration ready');

    // Wait for Firebase services
    console.log('Waiting for Firebase service...');
    await waitForFirebaseService();
    console.log('Firebase service ready');

    // Initialize Firebase authentication
    console.log('Initializing Firebase authentication...');
    await initFirebaseAuth();
    console.log('Firebase authentication complete');

    // Log environment info
    if (window.EnvironmentConfig && window.CommentatorLogger) {
      const env = window.EnvironmentConfig.getEnvironment();
      const features = window.EnvironmentConfig.getFeatures();
      window.CommentatorLogger.info(`Environment: ${env}`, 'CONFIG');
      window.CommentatorLogger.info(
        `Debug mode: ${window.EnvironmentConfig.isDebugMode()}`,
        'CONFIG'
      );
      window.CommentatorLogger.info(
        `Features enabled: ${Object.keys(features)
          .filter((k) => features[k])
          .join(', ')}`,
        'CONFIG'
      );
    }

    // Get base URL for the application
    const baseUrl = getBaseUrl();

    // Initialize components (header/footer)
    console.log('Loading components...');
    await initComponents(baseUrl);

    // Initialize all UI modules
    console.log('Initializing navigation...');
    await loadBreadcrumb(baseUrl);
    await loadNavigationSchema(baseUrl);
    initSmoothScrolling();
    initNavigationHighlight();
    initKeyboardNavigation();

    console.log('Initializing forms and notifications...');
    initNewsletterForm();
    initFormStyles();

    console.log('Initializing UI interactions...');
    initAllUIInteractions();

    console.log('Initializing comment system...');
    initCommentInterface();
    initCommentStyles();

    console.log('Initializing Web3...');
    initWeb3();
    initWeb3Styles();

    // Initialize SEO Schema
    console.log('Initializing SEO Schema...');
    if (typeof window.initializeSEOSchema === 'function') {
      const schemaManager = window.initializeSEOSchema();
      
      // Add page-specific schema based on current page
      const currentPath = window.location.pathname;
      if (currentPath.includes('/docs/')) {
        if (currentPath.includes('faq')) {
          schemaManager.addPageSchema('faq', {
            questions: window.SEO_SCHEMA_CONFIG?.faqQuestions || []
          });
        } else if (currentPath.includes('api')) {
          schemaManager.addPageSchema('documentation', {
            "@type": "APIReference",
            "programmingLanguage": "JavaScript"
          });
        } else {
          schemaManager.addPageSchema('documentation', {
            "headline": document.title,
            "description": document.querySelector('meta[name="description"]')?.content
          });
        }
        
        // Add breadcrumb schema for documentation pages
        const breadcrumbs = window.SEO_SCHEMA_CONFIG?.breadcrumbs?.[currentPath] || 
                          window.SEO_SCHEMA_CONFIG?.breadcrumbs?.['docs/'];
        if (breadcrumbs) {
          const breadcrumbSchema = schemaManager.generateBreadcrumbSchema(breadcrumbs);
          schemaManager.addPageSchema('breadcrumb', breadcrumbSchema);
        }
      }
      
      // Inject all schemas
      schemaManager.injectSchemas();
      console.log('✅ SEO Schema initialized and injected');
    } else {
      console.warn('⚠️ SEO Schema module not available');
    }

    // Run accessibility validation in development
    setTimeout(() => {
      validateAccessibility();
    }, 1000);

    // Initialize debug help button
    initDebugHelpButton();

    // Log successful initialization
    setTimeout(() => {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.success(
          '🎉 All modules initialized successfully!',
          'INIT'
        );
      }
      console.log(
        '🎉 Commentator v2.0 fully initialized with modular architecture!'
      );
    }, 500);
  } catch (error) {
    console.error('❌ Error during application initialization:', error);
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Initialization error: ${error.message}`,
        'INIT',
        error
      );
    }

    // Try to enable basic functionality as fallback
    enableBasicFunctionality();
  }
}

// Set up cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.currentCommentsUnsubscribe) {
    window.currentCommentsUnsubscribe();
  }
});

// Wait for DOM and initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

// Export key functions for module usage
export {
  initializeApp,
  setupGlobalAPI,
  waitForEnvironmentConfig,
  waitForFirebaseService,
  initFirebaseAuth,
  updateUserStatus,
  enableBasicFunctionality,
};
