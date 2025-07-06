/**
 * Commentator - Main JavaScript File
 *
 * This file provides basic interactivity for the Commentator homepage.
 * It includes:
 * - Header and footer component loading
 * - Smooth scrolling navigation
 * - Comment interface placeholder functionality
 * - Basic form handling
 * - Event listeners for user interactions
 *
 * Note: This is a foundational file that can be extended as the project grows.
 */

/**
 * Get the base URL for the site (handles GitHub Pages deployment and subdirectories)
 */
function getBaseUrl() {
  const path = window.location.pathname;

  // Check if we're on GitHub Pages
  if (window.location.hostname === 'kamrankhan78694.github.io') {
    // For GitHub Pages, check if we're in a subdirectory
    if (path.startsWith('/docs/')) {
      return '../';
    }
    return '/Commentator/';
  }

  // Local development or other deployments
  // Check if we're in a subdirectory (contains at least one folder before the file)
  if (path.includes('/docs/')) {
    return '../';
  }

  return './';
}

/**
 * Load header and footer components dynamically
 */
async function loadHeaderAndFooter() {
  try {
    const baseUrl = getBaseUrl();

    // Load header
    const headerResponse = await fetch(`${baseUrl}includes/header.html`);
    if (headerResponse.ok) {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.success(
          'Header loaded successfully',
          'COMPONENTS'
        );
      }
      const headerHTML = await headerResponse.text();
      const headerPlaceholder = document.getElementById('header-placeholder');
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;

        // Fix the logo link to use proper base URL
        const logoLink = document.getElementById('logo-link');
        if (logoLink) {
          logoLink.href = `${baseUrl}index.html`;
        }

        // Fix the logo image path to use proper base URL
        const logoImg = headerPlaceholder.querySelector('.logo-image');
        if (logoImg) {
          logoImg.src = `${baseUrl}assets/logo-light.svg`;
        }

        configureNavigation();
        // Re-initialize navigation-dependent functions after header is loaded
        initSmoothScrolling();
        initNavigationHighlight();
        initMobileMenu();
        initKeyboardNavigation();
      }
    } else {
      console.warn('Failed to load header:', headerResponse.status);
      if (window.CommentatorLogger) {
        window.CommentatorLogger.error(
          `Failed to load header: ${headerResponse.status}`,
          'COMPONENTS'
        );
      }
    }

    // Load breadcrumb
    await loadBreadcrumb(baseUrl);

    // Load navigation schema
    await loadNavigationSchema(baseUrl);

    // Load footer
    const footerResponse = await fetch(`${baseUrl}includes/footer.html`);
    if (footerResponse.ok) {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.success(
          'Footer loaded successfully',
          'COMPONENTS'
        );
      }
      const footerHTML = await footerResponse.text();
      const footerPlaceholder = document.getElementById('footer-placeholder');
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;

        // Fix footer links to use proper base URL
        fixFooterLinks(baseUrl);
        // Initialize footer functionality
        initNewsletterForm();
        // Initialize feather icons in footer
        if (typeof feather !== 'undefined') {
          feather.replace();
        }
      }
    } else {
      console.warn('Failed to load footer:', footerResponse.status);
      if (window.CommentatorLogger) {
        window.CommentatorLogger.error(
          `Failed to load footer: ${footerResponse.status}`,
          'COMPONENTS'
        );
      }
    }

    // Initialize back to top button
    initBackToTop();

    // Run accessibility validation in development
    setTimeout(() => {
      validateAccessibility();
    }, 1000);
  } catch (error) {
    console.error('Error loading header/footer components:', error);
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        'Error loading header/footer components',
        'COMPONENTS',
        error
      );
    }
  }
}

/**
 * Fix footer links to use proper base URL
 */
function fixFooterLinks(baseUrl) {
  const footer = document.getElementById('footer-placeholder');
  if (!footer) return;

  // Fix internal navigation links
  const internalLinks = footer.querySelectorAll(
    'a[href^="index.html"], a[href^="docs/"]'
  );
  internalLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href.startsWith('index.html') || href.startsWith('docs/')) {
      link.href = baseUrl + href;
    }
  });
}

/**
 * Configure navigation based on current page
 */
function configureNavigation() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const currentPage = window.location.pathname;
  const baseUrl = getBaseUrl();
  let navItems = [];

  if (currentPage.includes('/docs/')) {
    // Documentation page navigation
    navItems = [
      { href: `${baseUrl}docs/`, text: 'Documentation Home' },
      { href: `${baseUrl}docs/getting-started.html`, text: 'Getting Started' },
      { href: `${baseUrl}docs/usage.html`, text: 'Usage' },
      { href: `${baseUrl}docs/api.html`, text: 'API' },
      { href: `${baseUrl}docs/contributing.html`, text: 'Contributing' },
      { href: `${baseUrl}docs/faq.html`, text: 'FAQ' },
      { href: `${baseUrl}index.html`, text: 'Home' },
    ];
  } else {
    // Homepage navigation
    navItems = [
      { href: '#features', text: 'Features' },
      { href: '#how-it-works', text: 'How It Works' },
      { href: '#about', text: 'About' },
      { href: `${baseUrl}docs/`, text: 'Documentation' },
      {
        href: 'https://github.com/kamrankhan78694/Commentator',
        text: 'GitHub',
        target: '_blank',
      },
    ];
  }

  // Build navigation HTML
  nav.innerHTML = navItems
    .map(
      (item) =>
        `<a href="${item.href}"${item.target ? ` target="${item.target}"` : ''}>${item.text}</a>`
    )
    .join('');
}

// Note: scrollToDemo function exists but currently unused
// Kept for potential future use
/**
 * Scroll to demo section smoothly
 */
// function scrollToDemo() {
//   const demoSection = document.querySelector('.demo');
//   if (demoSection) {
//     demoSection.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start'
//     });
//   }
// }

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🗨️ Commentator interface initialized');

  // Log application initialization
  if (window.CommentatorLogger) {
    window.CommentatorLogger.info('Application initializing...', 'INIT');
    window.CommentatorLogger.action(
      'Loading environment configuration',
      'info',
      'INIT'
    );
  } // Wait for environment configuration to be ready
  console.log('Waiting for environment configuration...');
  await waitForEnvironmentConfig();
  console.log('Environment configuration ready');

  // Wait for Firebase services to be available
  console.log('Waiting for Firebase service...');
  await waitForFirebaseService();
  console.log('Firebase service ready');

  // Initialize Firebase authentication first
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

  // Initialize all functionality
  loadHeaderAndFooter();
  initCommentInterface();

  // Initialize debug help button
  initDebugHelpButton();

  // Log successful initialization
  setTimeout(() => {
    if (window.CommentatorLogger) {
      window.CommentatorLogger.success(
        'Application initialized successfully',
        'INIT'
      );
      window.CommentatorLogger.info(
        'Debug panel available - Press Ctrl+~ to toggle',
        'HELP'
      );
    }
  }, 1000);
});

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
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navContainer = document.getElementById('nav-container');

  if (!mobileMenuToggle || !navContainer) return;

  mobileMenuToggle.addEventListener('click', () => {
    const isActive = mobileMenuToggle.classList.contains('active');

    if (isActive) {
      mobileMenuToggle.classList.remove('active');
      navContainer.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    } else {
      mobileMenuToggle.classList.add('active');
      navContainer.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInsideMenu =
      mobileMenuToggle.contains(e.target) || navContainer.contains(e.target);

    if (!isClickInsideMenu && navContainer.classList.contains('active')) {
      mobileMenuToggle.classList.remove('active');
      navContainer.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close mobile menu when window is resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenuToggle.classList.remove('active');
      navContainer.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Initialize newsletter form functionality
 */
function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');

  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();

    if (!email) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // In a real implementation, this would send the email to a backend service
    // For now, we'll just show a success message
    showNotification(
      'Thank you for subscribing! We\'ll keep you updated on important project news.',
      'success'
    );
    emailInput.value = '';
  });
}

/**
 * Validate email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Close mobile menu if open
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navContainer = document.getElementById('nav-container');
        if (mobileMenuToggle && navContainer) {
          mobileMenuToggle.classList.remove('active');
          navContainer.classList.remove('active');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

/**
 * Initialize the comment interface functionality
 */
function initCommentInterface() {
  const urlInput = document.getElementById('website-url');
  const loadCommentsBtn = document.getElementById('load-comments-btn');
  const commentsSection = document.getElementById('comments-section');
  const commentText = document.getElementById('comment-text');
  const submitCommentBtn = document.getElementById('submit-comment-btn');
  const getStartedBtn = document.getElementById('get-started-btn');
  const demoBtn = document.getElementById('demo-btn');

  // Handle "Get Started" button click
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      // Scroll to demo section
      const demoSection = document.getElementById('demo-section');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Handle "View Demo" button click
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          'User clicked "View Demo" button',
          'info',
          'USER_INTERACTION'
        );
      }
      // Scroll to demo section and focus on URL input
      const demoSection = document.getElementById('demo-section');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (urlInput) urlInput.focus();
        }, 500);
      }
    });
  }

  // Handle "Load Comments" button click
  if (loadCommentsBtn && urlInput && commentsSection) {
    loadCommentsBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();

      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          `User clicked "Load Comments" for URL: ${url || '(empty)'}`,
          'info',
          'USER_INTERACTION'
        );
      }

      if (!url) {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.warning(
            'User attempted to load comments with empty URL',
            'VALIDATION'
          );
        }
        showNotification('Please enter a valid URL', 'error');
        urlInput.focus();
        return;
      }

      if (!isValidUrl(url)) {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.warning(
            `User entered invalid URL: ${url}`,
            'VALIDATION'
          );
        }
        showNotification(
          'Please enter a valid URL (e.g., https://example.com)',
          'error'
        );
        urlInput.focus();
        return;
      }

      // Show loading state on button
      const originalText = loadCommentsBtn.textContent;
      loadCommentsBtn.textContent = 'Loading...';
      loadCommentsBtn.disabled = true;

      // Load comments with proper API integration
      loadCommentsForUrl(url, commentsSection).finally(() => {
        // Reset button state
        loadCommentsBtn.textContent = originalText;
        loadCommentsBtn.disabled = false;
      });
    });
  }

  // Handle "Submit Comment" button click
  if (submitCommentBtn && commentText) {
    submitCommentBtn.addEventListener('click', () => {
      const comment = commentText.value.trim();
      const url = urlInput ? urlInput.value.trim() : '';

      console.log('Submit button clicked:', {
        comment: comment.length,
        url: url.length,
      });

      if (!url) {
        showNotification('Please load a URL first', 'error');
        return;
      }

      if (!comment) {
        showNotification('Please enter a comment', 'error');
        commentText.focus();
        return;
      }

      console.log('Submitting comment:', { url, comment });

      // Submit comment with real API integration
      submitComment(url, comment, commentsSection, commentText);
    });
  }

  // Add Enter key support for URL input
  if (urlInput && loadCommentsBtn) {
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loadCommentsBtn.click();
      }
    });
  }
}

/**
 * Initialize navigation highlight on scroll
 */
function initNavigationHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      // sectionHeight calculated but not used in this context
      section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Load breadcrumb navigation
 */
async function loadBreadcrumb(baseUrl) {
  try {
    const breadcrumbResponse = await fetch(
      `${baseUrl}includes/breadcrumb.html`
    );
    if (breadcrumbResponse.ok) {
      const breadcrumbHTML = await breadcrumbResponse.text();

      // Insert breadcrumb after header
      const header = document.querySelector('.header');
      if (header) {
        const breadcrumbContainer = document.createElement('div');
        breadcrumbContainer.innerHTML = breadcrumbHTML;
        header.parentNode.insertBefore(
          breadcrumbContainer.firstElementChild,
          header.nextSibling
        );

        // Generate breadcrumb items
        generateBreadcrumbItems(baseUrl);
      }
    }
  } catch (error) {
    console.warn('Failed to load breadcrumb:', error);
  }
}

/**
 * Generate breadcrumb items based on current page
 */
function generateBreadcrumbItems(baseUrl) {
  const breadcrumbList = document.querySelector('.breadcrumb-list');
  if (!breadcrumbList) return;

  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter((segment) => segment);

  // Always start with Home
  const breadcrumbItems = [
    { name: 'Home', url: `${baseUrl}index.html`, position: 1 },
  ];

  // Add path-specific breadcrumbs
  if (currentPath.includes('/docs/')) {
    breadcrumbItems.push({
      name: 'Documentation',
      url: `${baseUrl}docs/`,
      position: 2,
    });

    // Add specific documentation page
    const docPage = pathSegments[pathSegments.length - 1];
    if (docPage && docPage !== 'index.html') {
      const pageName = docPage
        .replace('.html', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      breadcrumbItems.push({
        name: pageName,
        url: '',
        position: 3,
        current: true,
      });
    }
  }

  // Generate breadcrumb HTML with schema markup
  breadcrumbList.innerHTML = breadcrumbItems
    .map((item) => {
      if (item.current) {
        return `
                <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <span class="breadcrumb-current" itemprop="name">${item.name}</span>
                    <meta itemprop="position" content="${item.position}">
                </li>
            `;
      } else {
        return `
                <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <a href="${item.url}" class="breadcrumb-link" itemprop="item">
                        <span itemprop="name">${item.name}</span>
                    </a>
                    <meta itemprop="position" content="${item.position}">
                </li>
            `;
      }
    })
    .join('');
}

/**
 * Load navigation schema for SEO
 */
async function loadNavigationSchema(baseUrl) {
  try {
    const schemaResponse = await fetch(
      `${baseUrl}includes/navigation-schema.html`
    );
    if (schemaResponse.ok) {
      const schemaHTML = await schemaResponse.text();

      // Add schema to head
      const head = document.querySelector('head');
      if (head) {
        const schemaContainer = document.createElement('div');
        schemaContainer.innerHTML = schemaHTML;
        head.appendChild(schemaContainer);
      }
    }
  } catch (error) {
    console.warn('Failed to load navigation schema:', error);
  }
}

/**
 * Initialize keyboard navigation
 */
function initKeyboardNavigation() {
  // Add keyboard support for navigation links
  const navLinks = document.querySelectorAll('.nav a');

  navLinks.forEach((link) => {
    link.addEventListener('keydown', function (e) {
      const links = Array.from(navLinks);
      const currentIndex = links.indexOf(this);

      switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : links.length - 1;
        links[prevIndex].focus();
        break;
      }
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex =
            currentIndex < links.length - 1 ? currentIndex + 1 : 0;
        links[nextIndex].focus();
        break;
      }
      case 'Home':
        e.preventDefault();
        links[0].focus();
        break;
      case 'End':
        e.preventDefault();
        links[links.length - 1].focus();
        break;
      }
    });
  });

  // Escape key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
      const navContainer = document.getElementById('nav-container');

      if (
        mobileMenuToggle &&
        navContainer &&
        navContainer.classList.contains('active')
      ) {
        mobileMenuToggle.classList.remove('active');
        navContainer.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.focus();
      }
    }
  });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
  // Create back to top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i data-feather="arrow-up"></i>';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.setAttribute('title', 'Back to top');

  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  function toggleBackToTop() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Scroll to top when clicked
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Listen for scroll events
  window.addEventListener('scroll', toggleBackToTop);

  // Initialize feather icons for the button
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
}

/**
 * Basic accessibility validation
 */
function validateAccessibility() {
  const issues = [];

  // Check for missing alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      issues.push(
        `Heading hierarchy issue: ${heading.tagName} after h${lastLevel}`
      );
    }
    lastLevel = level;
  });

  // Check for interactive elements without proper focus indicators
  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, select'
  );
  interactiveElements.forEach((element) => {
    const style = window.getComputedStyle(element, ':focus');
    if (!style.outline || style.outline === 'none') {
      if (!style.boxShadow || !style.border) {
        issues.push(
          `Interactive element may lack proper focus indicator: ${element.tagName}`
        );
      }
    }
  });

  // Log issues in development
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    if (issues.length > 0) {
      console.group('🔍 Accessibility Issues Found:');
      issues.forEach((issue) => console.warn(issue));
      console.groupEnd();
    } else {
      console.log('✅ No accessibility issues detected');
    }
  }

  return issues;
}

/**
 * Load comments for a URL using Firebase
 * @param {string} url - The URL to load comments for
 * @param {HTMLElement} commentsSection - The element to display comments in
 */
async function loadCommentsForUrl(url, commentsSection) {
  if (window.CommentatorLogger) {
    window.CommentatorLogger.action(
      `Loading comments for ${url}`,
      'info',
      'COMMENTS'
    );
  }

  // Show loading state
  commentsSection.innerHTML = `
        <div class="loading">
            <p>🔄 Loading comments for ${url}...</p>
        </div>
    `;

  try {
    // Check if Firebase service is available
    if (typeof window.FirebaseService === 'undefined') {
      console.log('🏠 Firebase not available, loading comments locally');
      if (window.loadCommentsLocal) {
        return window.loadCommentsLocal(url, commentsSection);
      }
      throw new Error(
        'Firebase service is not available and local fallback is not ready. Please refresh the page.'
      );
    }

    // Load comments from Firebase
    const comments = await window.FirebaseService.loadComments(url);

    if (window.CommentatorLogger) {
      window.CommentatorLogger.success(
        `Loaded ${comments.length} comments for ${url}`,
        'COMMENTS'
      );
    }

    // Format timestamps for display
    const formattedComments = comments.map((comment) => ({
      ...comment,
      author: comment.author || 'Anonymous',
      timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
      votes: comment.votes || 0,
    }));

    displayComments(formattedComments, commentsSection);

    // Show success message
    if (formattedComments.length > 0) {
      showNotification(
        `Successfully loaded ${formattedComments.length} comment${formattedComments.length > 1 ? 's' : ''}`,
        'success'
      );
    } else {
      showNotification(
        'No comments found for this URL. Be the first to comment!',
        'info'
      );
    }

    // Set up real-time listener for new comments
    // Unsubscribe any existing listener to avoid multiple active subscriptions
    if (window.currentCommentsUnsubscribe) {
      window.currentCommentsUnsubscribe();
    }
    window.currentCommentsUnsubscribe =
      window.FirebaseService.subscribeToComments(url, (updatedComments) => {
        const formattedUpdated = updatedComments.map((comment) => ({
          ...comment,
          author: comment.author || 'Anonymous',
          timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
          votes: comment.votes || 0,
        }));
        displayComments(formattedUpdated, commentsSection);
      });
  } catch (error) {
    console.error('Error loading comments:', error);
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Failed to load comments for ${url}: ${error.message}`,
        'COMMENTS',
        error
      );
    }
    commentsSection.innerHTML = `
            <div class="error-state">
                <p>❌ Failed to load comments: ${error.message}</p>
                <button id="retry-button" class="btn btn-secondary">
                    Retry
                </button>
            </div>
        `;

    // Show error notification
    showNotification(`Failed to load comments: ${error.message}`, 'error');

    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        if (window.CommentatorLogger) {
          window.CommentatorLogger.action(
            'Retrying comment load',
            'info',
            'COMMENTS'
          );
        }
        loadCommentsForUrl(url, commentsSection);
      });
    }
  }
}

/**
 * Display comments in the comments section
 * @param {Array} comments - Array of comment objects
 * @param {HTMLElement} commentsSection - The element to display comments in
 * @param {boolean} isNFT - Whether to render as NFT comments
 */
function displayComments(comments, commentsSection, isNFT = false) {
  if (comments.length === 0) {
    commentsSection.innerHTML = `
            <div class="no-comments">
                <p>No comments yet for this URL. Be the first to share your thoughts!</p>
            </div>
        `;
    return;
  }

  const commentsHtml = comments
    .map((comment) => {
      if (comment.isNFT || isNFT) {
        const shortAddress =
          comment.author.length > 10
            ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
            : comment.author;

        return `
                <div class="comment nft-comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${shortAddress}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                        <span class="nft-badge">🖼️ NFT #${comment.nftId || comment.id}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="nft-info">
                        <small>
                            <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
                            | Wallet: <span title="${comment.author}">${shortAddress}</span>
                        </small>
                    </div>
                </div>
            `;
      } else {
        return `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${comment.author}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
      }
    })
    .join('');

  commentsSection.innerHTML = `
        <div class="comments-list">
            <h4>💬 Comments (${comments.length})</h4>
            ${commentsHtml}
        </div>
    `;
}

/**
 * Submit a new comment using Firebase API
 * @param {string} url - The URL the comment is for
 * @param {string} comment - The comment text
 * @param {HTMLElement} commentsSection - The comments display element
 * @param {HTMLElement} commentTextarea - The comment input element
 */
async function submitComment(url, comment, commentsSection, commentTextarea) {
  console.log('📝 submitComment called with:', {
    url,
    comment: comment.substring(0, 50) + '...',
    commentsSection: !!commentsSection,
    commentTextarea: !!commentTextarea,
  });

  // Check if Firebase is available, otherwise use local functionality
  if (
    typeof window.FirebaseService === 'undefined' ||
    !window.FirebaseService.isUserAuthenticated
  ) {
    console.log('🏠 Firebase not available, using local submission');
    if (window.submitCommentLocal) {
      return window.submitCommentLocal(
        url,
        comment,
        commentsSection,
        commentTextarea
      );
    }
  }

  // Show submitting state
  const submitBtn = document.getElementById('submit-comment-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    console.log('🔍 Checking Firebase service availability...');
    // Check if Firebase service is available
    if (typeof window.FirebaseService === 'undefined') {
      throw new Error(
        'Firebase service is not available. Please refresh the page and try again.'
      );
    }
    console.log('✅ Firebase service is available');

    console.log('🔐 Checking authentication state...');
    // Check authentication state first
    if (!window.FirebaseService.isUserAuthenticated()) {
      console.log(
        '⚠️ User not authenticated, attempting to re-authenticate...'
      );
      updateUserStatus('🔄 Re-authenticating...');

      const user = await window.FirebaseService.initAuth();
      if (!user) {
        throw new Error(
          'Authentication failed. Please refresh the page and try again.'
        );
      }
      console.log('✅ Re-authentication successful');
      updateUserStatus('✅ Connected anonymously');
    } else {
      console.log('✅ User is already authenticated');
    }

    // Validate input data
    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    if (comment.length > 5000) {
      throw new Error('Comment is too long (maximum 5000 characters)');
    }

    console.log('📊 Preparing comment data...');
    const commentData = {
      author: 'Anonymous', // In a real app, this would be the logged-in user
      text: comment.trim(),
      votes: 0,
      timestamp: new Date().toISOString(),
    };

    console.log('💾 Saving comment to Firebase...');
    // Save comment to Firebase with detailed logging
    const commentId = await window.FirebaseService.saveComment(
      url,
      commentData
    );
    console.log('✅ Comment saved successfully with ID:', commentId);

    // Clear the textarea
    commentTextarea.value = '';

    // Show success message
    showNotification('Comment submitted successfully! 🎉', 'success');

    console.log('🔄 Reloading comments to show new comment...');
    // Reload comments to show the new one
    await loadCommentsForUrl(url, commentsSection);
  } catch (error) {
    console.error('❌ Error submitting comment:', error);

    // Log detailed error information
    console.error('📊 Detailed error info:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Show user-friendly error message
    let errorMessage = 'Failed to submit comment. ';

    if (
      error.message.includes('authentication') ||
      error.message.includes('auth')
    ) {
      errorMessage += 'Please refresh the page and try again.';
    } else if (
      error.message.includes('network') ||
      error.message.includes('connection')
    ) {
      errorMessage += 'Please check your internet connection and try again.';
    } else if (
      error.message.includes('permission') ||
      error.message.includes('denied')
    ) {
      errorMessage +=
        'Permission denied. Please refresh the page and try again.';
    } else {
      errorMessage += error.message;
    }

    showNotification(errorMessage, 'error');

    // Log to debug logger if available
    if (window.CommentatorLogger) {
      window.CommentatorLogger.error(
        `Comment submission failed: ${error.message}`,
        'COMMENTS',
        error
      );
    }
  } finally {
    // Reset submit button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Scroll to comments section
    setTimeout(() => {
      const newCommentElement = commentsSection.querySelector('.new-comment');
      if (newCommentElement) {
        newCommentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setTimeout(() => {
          newCommentElement.classList.remove('new-comment');
        }, 3000);
      }
    }, 100);
  }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Set colors based on type
  let backgroundColor, textColor;
  switch (type) {
  case 'error':
    backgroundColor = '#e53e3e';
    textColor = 'white';
    break;
  case 'info':
    backgroundColor = '#3182ce';
    textColor = 'white';
    break;
  case 'success':
  default:
    backgroundColor = '#38a169';
    textColor = 'white';
  }

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: ${textColor};
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Animate out and remove
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add some additional styles for the comment interface
const additionalStyles = `
    .comment {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        background-color: white;
        transition: all 0.2s ease;
    }
    
    .comment:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .comment-author {
        font-weight: 600;
        color: #1a202c;
    }
    
    .comment-timestamp {
        color: #718096;
        font-size: 0.9em;
    }
    
    .comment-votes {
        color: #38a169;
        font-weight: 500;
    }
    
    .comment-text {
        color: #2d3748;
        line-height: 1.6;
    }
    
    .new-comment {
        border-color: #38a169;
        background-color: #f0fff4;
    }
    
    .loading {
        text-align: center;
        color: #718096;
        font-style: italic;
    }
    
    .no-comments {
        text-align: center;
        color: #718096;
        font-style: italic;
    }
    
    .nav a.active {
        color: #3182ce;
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .comment-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

/**
 * ========================================
 * WEB3 & NFT Integration
 * ========================================
 */

// Contract configuration (update these for your deployment)
const CONTRACT_CONFIG = {
  address: '0x1234567890123456789012345678901234567890', // Replace with deployed contract address
  abi: [
    // Essential ABI for CommentNFT contract
    'function mintComment(address to, string memory threadId, string memory ipfsHash) public returns (uint256)',
    'function getThreadComments(string memory threadId) public view returns (uint256[] memory)',
    'function getComment(uint256 tokenId) public view returns (tuple(address author, string threadId, string ipfsHash, uint256 timestamp))',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function totalComments() public view returns (uint256)',
  ],
  networks: {
    mumbai: {
      chainId: '0x13881', // 80001 in hex
      name: 'Polygon Mumbai',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      blockExplorer: 'https://mumbai.polygonscan.com/',
    },
    localhost: {
      chainId: '0x7a69', // 31337 in hex
      name: 'Local Hardhat',
      rpcUrl: 'http://127.0.0.1:8545',
      blockExplorer: '',
    },
  },
};

// Web3 state
let web3State = {
  provider: null,
  signer: null,
  contract: null,
  userAddress: null,
  networkId: null,
  connected: false,
};

/**
 * Initialize Web3 functionality
 */
function initWeb3() {
  const connectBtn = document.getElementById('connect-wallet-btn');
  const disconnectBtn = document.getElementById('disconnect-wallet-btn');
  // submitBtn referenced but not used in this scope
  document.getElementById('submit-comment-btn');

  if (connectBtn) {
    connectBtn.addEventListener('click', connectWallet);
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectWallet);
  }

  // Check if already connected
  if (window.ethereum) {
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(console.error);
  }

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
  try {
    if (!window.ethereum) {
      showNotification(
        'MetaMask not detected. Please install MetaMask.',
        'error'
      );
      return;
    }

    showNotification('Connecting to MetaMask...', 'info');

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Initialize ethers provider
    web3State.provider = new ethers.BrowserProvider(window.ethereum);
    web3State.signer = await web3State.provider.getSigner();
    web3State.userAddress = accounts[0];

    // Get network info
    const network = await web3State.provider.getNetwork();
    web3State.networkId = network.chainId.toString();

    // Initialize contract (use mock contract for demo)
    try {
      web3State.contract = new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        web3State.signer
      );
    } catch (error) {
      console.warn('Contract not deployed, using mock contract for demo');
      web3State.contract = null;
    }

    web3State.connected = true;
    updateWalletUI();

    showNotification('Wallet connected successfully!', 'success');
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showNotification(`Failed to connect wallet: ${error.message}`, 'error');
  }
}

/**
 * Disconnect wallet
 */
function disconnectWallet() {
  web3State = {
    provider: null,
    signer: null,
    contract: null,
    userAddress: null,
    networkId: null,
    connected: false,
  };

  updateWalletUI();
  showNotification('Wallet disconnected', 'info');
}

/**
 * Handle account changes
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0] !== web3State.userAddress) {
    connectWallet();
  }
}

/**
 * Handle chain/network changes
 */
function handleChainChanged() {
  // Reload the page when network changes
  window.location.reload();
}

/**
 * Update wallet UI
 */
function updateWalletUI() {
  const walletStatus = document.getElementById('wallet-status');
  const walletInfo = document.getElementById('wallet-info');
  const walletAddress = document.getElementById('wallet-address');
  const networkName = document.getElementById('network-name');
  const submitBtn = document.getElementById('submit-comment-btn');

  if (web3State.connected) {
    if (walletStatus) walletStatus.style.display = 'none';
    if (walletInfo) walletInfo.style.display = 'block';

    if (walletAddress) {
      const shortAddress = `${web3State.userAddress.slice(0, 6)}...${web3State.userAddress.slice(-4)}`;
      walletAddress.textContent = shortAddress;
      walletAddress.title = web3State.userAddress;
    }

    if (networkName) {
      const network = getNetworkName(web3State.networkId);
      networkName.textContent = network;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Comment as NFT';
    }
  } else {
    if (walletStatus) walletStatus.style.display = 'block';
    if (walletInfo) walletInfo.style.display = 'none';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connect Wallet to Submit';
    }
  }
}

/**
 * Get network name from chain ID
 */
function getNetworkName(chainId) {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    31337: 'Local Hardhat',
  };
  return networks[chainId] || `Network ${chainId}`;
}

/**
 * Modified submit comment function with NFT integration
 * Note: Currently unused but kept for potential future NFT functionality
 */
// async function submitCommentAsNFT(url, comment, commentsSection, commentTextarea) {
//   if (!web3State.connected) {
//     showNotification('Please connect your wallet first', 'error');
//     return;
//   }
//
//   const submitBtn = document.getElementById('submit-comment-btn');
//   const originalText = submitBtn.textContent;
//
//   try {
//     // Step 1: Upload to IPFS
//     submitBtn.textContent = 'Uploading to IPFS...';
//     submitBtn.disabled = true;
//
//     const ipfsUrl = await IPFSIntegration.uploadCommentToIPFS(comment, {
//       author: web3State.userAddress,
//       url: url
//     });
//
//     console.log('Comment uploaded to IPFS:', ipfsUrl);
//
//     // Step 2: Mint NFT
//     submitBtn.textContent = 'Minting NFT...';
//
//     const threadId = IPFSIntegration.generateThreadId(url);
//     const ipfsHash = IPFSIntegration.extractIPFSHash(ipfsUrl);
//
//     let tokenId;
//     if (web3State.contract) {
//       // Real contract interaction
//       const tx = await web3State.contract.mintComment(
//         web3State.userAddress,
//         threadId,
//         ipfsHash
//       );
//
//       submitBtn.textContent = 'Confirming transaction...';
//       const receipt = await tx.wait();
//
//       // Extract token ID from events
//       const event = receipt.logs.find(log => log.topics[0] === ethers.id('CommentMinted(uint256,address,string,string,uint256)'));
//       tokenId = ethers.getBigInt(event?.topics[1] || '0').toString();
//
//     } else {
//       // Mock NFT minting for demo
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       tokenId = Date.now().toString();
//       console.log('Mock NFT minted with token ID:', tokenId);
//     }
//
//     // Step 3: Display the new NFT comment
//     const newComment = {
//       id: tokenId,
//       author: web3State.userAddress,
//       text: comment,
//       timestamp: new Date().toLocaleString(),
//       votes: 0,
//       nftId: tokenId,
//       ipfsUrl: ipfsUrl,
//       isNFT: true
//     };
//
//     displayNFTComment(newComment, commentsSection);
//
//     // Clear the textarea
//     commentTextarea.value = '';
//
//     showNotification('Comment minted as NFT successfully! 🎉', 'success');
//
//   } catch (error) {
//     console.error('Error submitting comment as NFT:', error);
//     showNotification(`Failed to submit comment: ${error.message}`, 'error');
//   } finally {
//     submitBtn.textContent = originalText;
//     submitBtn.disabled = !web3State.connected;
//   }
// }

/**
 * Display NFT comment in the UI
 * Note: Currently unused but kept for potential future NFT functionality
 */
// function displayNFTComment(comment, commentsSection) {
//   const existingComments = commentsSection.querySelector('.comments-list');
//
//   const shortAddress = comment.author.slice(0, 6) + '...' + comment.author.slice(-4);
//   const nftCommentHtml = `
//         <div class="comment nft-comment new-comment">
//             <div class="comment-header">
//                 <span class="comment-author">👤 ${shortAddress}</span>
//                 <span class="comment-timestamp">${comment.timestamp}</span>
//                 <span class="comment-votes">👍 ${comment.votes}</span>
//                 <span class="nft-badge">🖼️ NFT #${comment.nftId}</span>
//             </div>
//             <div class="comment-text">${comment.text}</div>
//             <div class="nft-info">
//                 <small>
//                     <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
//                     | Wallet: <span title="${comment.author}">${shortAddress}</span>
//                 </small>
//             </div>
//         </div>
//     `;
//
//   if (existingComments) {
//     existingComments.insertAdjacentHTML('beforeend', nftCommentHtml);
//   } else {
//     displayComments([comment], commentsSection, true);
//   }
//
//   // Scroll to the new comment
//   setTimeout(() => {
//     const newCommentElement = commentsSection.querySelector('.new-comment');
//     if (newCommentElement) {
//       newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       setTimeout(() => {
//         newCommentElement.classList.remove('new-comment');
//       }, 3000);
//     }
//   }, 100);
// }

// Initialize Web3 when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initWeb3();
  initFirebaseAuth();
});

/**
 * ========================================
 * FIREBASE INTEGRATION UTILITIES
 * ========================================
 */

// Global variables for Firebase integration
let currentSession = null;
const currentCommentsUnsubscribe = null;

/**
 * Initialize Firebase authentication and session
 */
async function initFirebaseAuth() {
  try {
    console.log('🔥 Initializing Firebase authentication...');

    // Check if Firebase service is available with timeout
    let firebaseCheckCount = 0;
    const maxFirebaseChecks = 5; // Limit to 5 attempts instead of infinite loop

    while (
      typeof window.FirebaseService === 'undefined' &&
      firebaseCheckCount < maxFirebaseChecks
    ) {
      console.warn(
        `⚠️ Firebase service not available, attempt ${firebaseCheckCount + 1}/${maxFirebaseChecks}...`
      );
      updateUserStatus('🔄 Waiting for Firebase...');

      // Wait with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (firebaseCheckCount + 1))
      );
      firebaseCheckCount++;
    }

    // If Firebase is still not available after max attempts, continue without it
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

    // Initialize authentication with timeout
    const authTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Authentication timeout')), 15000);
    });

    const authPromise = window.FirebaseService.initAuth();

    const user = await Promise.race([authPromise, authTimeout]);

    if (user) {
      console.log('✅ Firebase authentication successful:', user.uid);

      // Update user status display
      updateUserStatus('✅ Connected anonymously');

      // Enable submit button - but only after successful auth
      const submitBtn = document.getElementById('submit-comment-btn');
      if (submitBtn) {
        submitBtn.disabled = false;
        console.log('✅ Submit button enabled');
      }

      // Verify authentication state
      const isAuth = window.FirebaseService.isUserAuthenticated();
      console.log('🔐 Authentication verification:', isAuth);

      if (!isAuth) {
        console.error('❌ Authentication verification failed');
        updateUserStatus('❌ Auth verification failed');
        return;
      }

      try {
        // Create session
        console.log('📝 Creating user session...');
        currentSession = await window.FirebaseService.createSession({
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: Date.now(),
        });

        console.log('✅ Session created:', currentSession);

        // Set up session activity tracking
        setInterval(() => {
          if (currentSession && window.FirebaseService.isUserAuthenticated()) {
            window.FirebaseService.updateSessionActivity(currentSession);
          }
        }, 30000); // Update every 30 seconds

        console.log('🎉 Firebase authentication and session setup complete');
      } catch (sessionError) {
        console.warn(
          '⚠️ Session creation failed, but authentication succeeded:',
          sessionError
        );
        // Don't fail the whole process if session creation fails
      }
    } else {
      console.error('❌ Firebase authentication failed - no user returned');
      updateUserStatus('❌ Authentication failed');

      // Keep submit button disabled
      const submitBtn = document.getElementById('submit-comment-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase auth:', error);
    updateUserStatus('❌ Connection error');

    // Keep submit button disabled on error
    const submitBtn = document.getElementById('submit-comment-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    // Log detailed error info
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
 * Get user display name
 * Note: Currently unused but kept for potential future user functionality
 * @returns {Promise<string>} - User display name
 */
// async function getUserDisplayName() {
//   try {
//     const userData = await window.FirebaseService.loadUserData();
//     if (userData && userData.displayName) {
//       return userData.displayName;
//     }
//
//     // Generate a random display name for anonymous users
//     const adjectives = ['Happy', 'Smart', 'Kind', 'Friendly', 'Creative', 'Honest', 'Wise', 'Funny'];
//     const nouns = ['User', 'Commenter', 'Visitor', 'Reader', 'Member', 'Guest', 'Friend', 'Person'];
//     const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
//     const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
//     const randomNumber = Math.floor(Math.random() * 1000);
//
//     const displayName = `${randomAdjective}${randomNoun}${randomNumber}`;
//
//     // Save the generated display name
//     await window.FirebaseService.saveUserData({
//       displayName,
//       createdAt: Date.now()
//     });
//
//     return displayName;
//
//   } catch (error) {
//     console.error('Error getting user display name:', error);
//     return 'Anonymous';
//   }
// }

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted time string
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown time';

  const now = Date.now();
  const diff = now - timestamp;

  // Convert to seconds
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  // For older dates, show actual date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Initialize debug help button functionality
 */
function initDebugHelpButton() {
  const debugHelpBtn = document.getElementById('debug-help-btn');
  if (debugHelpBtn && window.CommentatorLogger) {
    debugHelpBtn.addEventListener('click', () => {
      window.CommentatorLogger.toggle();
      if (window.CommentatorLogger) {
        window.CommentatorLogger.action(
          'Debug panel toggled via help button',
          'info',
          'USER_INTERACTION'
        );
      }
    });
  }
}

/**
 * Clean up Firebase listeners when page unloads
 */
window.addEventListener('beforeunload', () => {
  // Unsubscribe from comment updates
  if (currentCommentsUnsubscribe) {
    currentCommentsUnsubscribe();
  }

  // Close session
  if (currentSession) {
    window.FirebaseService.closeSession(currentSession);
  }
});

/**
 * Enable basic functionality without Firebase
 * This ensures the interface works even if Firebase is unavailable
 */
function enableBasicFunctionality() {
  console.log('🔧 Enabling basic functionality without Firebase...');

  // Enable the submit button with local functionality
  const submitBtn = document.getElementById('submit-comment-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Comment (Local Mode)';
    console.log('✅ Submit button enabled in local mode');
  }

  // Override the comment submission function to work locally
  window.submitCommentLocal = async function (
    url,
    comment,
    commentsSection,
    commentTextarea
  ) {
    console.log('📝 Local comment submission:', {
      url,
      comment: comment.substring(0, 50) + '...',
    });

    // Show submitting state
    const submitButton = document.getElementById('submit-comment-btn');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock comment entry
      const mockComment = {
        id: 'local_' + Date.now(),
        author: 'Local User',
        text: comment,
        timestamp: new Date().toLocaleString(),
        votes: 0,
        isLocal: true,
      };

      // Display the comment
      displayLocalComment(mockComment, commentsSection);

      // Clear the textarea
      commentTextarea.value = '';

      // Show success message
      showNotification(
        'Comment submitted successfully! (Local mode - not saved)',
        'success'
      );
    } catch (error) {
      console.error('❌ Error in local comment submission:', error);
      showNotification(
        'Failed to submit comment locally: ' + error.message,
        'error'
      );
    } finally {
      // Reset submit button
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  };

  // Enable URL loading with mock data
  window.loadCommentsLocal = async function (url, commentsSection) {
    console.log('📂 Loading comments locally for:', url);

    commentsSection.innerHTML =
      '<div class="loading">🔄 Loading comments...</div>';

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create mock comments
    const mockComments = [
      {
        id: 'demo_1',
        author: 'Demo User',
        text:
          'This is a demonstration comment for ' +
          url +
          '. Firebase is not available, so this is local data.',
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        votes: 5,
        isLocal: true,
      },
      {
        id: 'demo_2',
        author: 'Test User',
        text: 'Another example comment showing the interface works even without Firebase connectivity.',
        timestamp: new Date(Date.now() - 7200000).toLocaleString(),
        votes: 2,
        isLocal: true,
      },
    ];

    // Display mock comments
    displayComments(mockComments, commentsSection, false);
    showNotification(
      `Loaded ${mockComments.length} demo comments for ${url} (Local mode)`,
      'info'
    );
  };

  console.log('✅ Basic functionality enabled - buttons should now work');
}

/**
 * Display a local comment in the UI
 */
function displayLocalComment(comment, commentsSection) {
  const existingComments = commentsSection.querySelector('.comments-list');

  const localCommentHtml = `
    <div class="comment local-comment new-comment">
      <div class="comment-header">
        <span class="comment-author">👤 ${comment.author}</span>
        <span class="comment-timestamp">${comment.timestamp}</span>
        <span class="comment-votes">👍 ${comment.votes}</span>
        <span class="local-badge">🏠 Local</span>
      </div>
      <div class="comment-text">${comment.text}</div>
    </div>
  `;

  if (existingComments) {
    existingComments.insertAdjacentHTML('afterbegin', localCommentHtml);
  } else {
    displayComments([comment], commentsSection, false);
  }

  // Scroll to the new comment
  setTimeout(() => {
    const newCommentElement = commentsSection.querySelector('.new-comment');
    if (newCommentElement) {
      newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        newCommentElement.classList.remove('new-comment');
      }, 3000);
    }
  }, 100);
}
