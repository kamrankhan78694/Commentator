/**
 * Navigation Module
 *
 * Handles URL utilities, navigation highlighting, breadcrumbs, smooth scrolling,
 * keyboard navigation, and schema generation for the Commentator application.
 *
 * @module Navigation
 */

/**
 * Get the base URL for the site (handles GitHub Pages deployment and subdirectories)
 * @returns {string} - The base URL for the site
 */
export function getBaseUrl() {
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
 * Validate if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Initialize smooth scrolling for navigation links
 */
export function initSmoothScrolling() {
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
 * Initialize navigation highlight on scroll
 */
export function initNavigationHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
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
 * Load breadcrumb navigation
 * @param {string} baseUrl - The base URL for the site
 */
export async function loadBreadcrumb(baseUrl) {
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
 * @param {string} baseUrl - The base URL for the site
 */
export function generateBreadcrumbItems(baseUrl) {
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
 * @param {string} baseUrl - The base URL for the site
 */
export async function loadNavigationSchema(baseUrl) {
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
export function initKeyboardNavigation() {
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
 * Configure navigation based on current page
 */
export function configureNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');

    // Remove any existing active classes
    link.classList.remove('active');

    // Check if this link corresponds to the current page
    if (href) {
      // Handle home page
      if (
        (currentPath === '/' || currentPath.endsWith('/index.html')) &&
        (href === '/' ||
          href.endsWith('/index.html') ||
          href === './index.html')
      ) {
        link.classList.add('active');
      }
      // Handle other pages
      else if (href !== '/' && currentPath.includes(href.replace('./', ''))) {
        link.classList.add('active');
      }
    }
  });

  // Update page title and meta description based on the current path
  updatePageMetadata(currentPath);
}

/**
 * Update page metadata based on current path
 * @param {string} currentPath - The current page path
 */
function updatePageMetadata(currentPath) {
  const baseTitle = 'Commentator';
  const baseDescription =
    'Improve transparency on the web with community-driven feedback';

  let pageTitle = baseTitle;
  let pageDescription = baseDescription;

  // Customize title and description based on path
  if (currentPath.includes('/docs/')) {
    pageTitle = `Documentation - ${baseTitle}`;
    pageDescription = `${baseDescription} - Documentation and guides`;
  }

  // Update document title
  document.title = pageTitle;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', pageDescription);
  }
}
