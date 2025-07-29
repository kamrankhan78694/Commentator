/**
 * Components Module
 *
 * Handles dynamic loading of header/footer components and navigation
 * configuration for the Commentator application.
 *
 * @module Components
 */

/**
 * Load header and footer components dynamically
 * @param {string} baseUrl - The base URL for the site
 */
export async function loadHeaderAndFooter(baseUrl) {
  try {
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

        // Navigation setup will be handled by caller
        configureNavigation(baseUrl);
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
 * @param {string} baseUrl - The base URL for the site
 */
export function fixFooterLinks(baseUrl) {
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
 * @param {string} baseUrl - The base URL for the site
 */
export function configureNavigation(baseUrl) {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const currentPage = window.location.pathname;
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

/**
 * Initialize all component-related functionality
 * @param {string} baseUrl - The base URL for the site
 */
export async function initComponents(baseUrl) {
  await loadHeaderAndFooter(baseUrl);

  // Components are loaded, now other modules can initialize
  return true;
}

/**
 * Check if components are loaded
 * @returns {boolean} - True if components are loaded
 */
export function areComponentsLoaded() {
  const header = document.getElementById('header-placeholder');
  const footer = document.getElementById('footer-placeholder');

  return (
    header &&
    header.innerHTML.trim() !== '' &&
    footer &&
    footer.innerHTML.trim() !== ''
  );
}

/**
 * Wait for components to be loaded
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - Resolves when components are loaded or timeout
 */
export function waitForComponents(timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkComponents = () => {
      if (areComponentsLoaded()) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }

      setTimeout(checkComponents, 100);
    };

    checkComponents();
  });
}
