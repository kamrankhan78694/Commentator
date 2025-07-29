/**
 * UI Interactions Module
 *
 * Handles mobile menu functionality, back-to-top button, and other
 * user interface interactions for the Commentator application.
 *
 * @module UIInteractions
 */

/**
 * Initialize mobile menu functionality
 */
export function initMobileMenu() {
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
 * Initialize back to top button
 */
export function initBackToTop() {
  // Create back to top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i data-feather="arrow-up"></i>';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.setAttribute('title', 'Back to top');

  // Add styles for the back to top button
  backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  function toggleBackToTop() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.classList.remove('visible');
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
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
 * Initialize button animations and hover effects
 */
export function initButtonAnimations() {
  // Add hover effects to buttons
  const buttons = document.querySelectorAll('button, .btn');

  buttons.forEach((button) => {
    button.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.transition = 'transform 0.2s ease';
    });

    button.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });

    button.addEventListener('mousedown', function () {
      this.style.transform = 'translateY(0) scale(0.98)';
    });

    button.addEventListener('mouseup', function () {
      this.style.transform = 'translateY(-2px) scale(1)';
    });
  });
}

/**
 * Initialize scroll animations for elements
 */
export function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll(
    '.section, .card, .comment, .feature'
  );

  animateElements.forEach((element) => {
    element.style.cssText += `
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    `;
    observer.observe(element);
  });

  // Add CSS for animation
  const animationStyles = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Initialize tooltip functionality
 */
export function initTooltips() {
  const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');

  elementsWithTooltips.forEach((element) => {
    const tooltipText = element.getAttribute('data-tooltip');

    element.addEventListener('mouseenter', () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      `;

      document.body.appendChild(tooltip);

      // Position tooltip
      const rect = element.getBoundingClientRect();
      tooltip.style.left =
        rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

      // Animate in
      setTimeout(() => {
        tooltip.style.opacity = '1';
      }, 10);

      // Store reference for cleanup
      element._tooltip = tooltip;
    });

    element.addEventListener('mouseleave', () => {
      if (element._tooltip) {
        element._tooltip.style.opacity = '0';
        setTimeout(() => {
          if (element._tooltip && element._tooltip.parentNode) {
            element._tooltip.parentNode.removeChild(element._tooltip);
          }
          element._tooltip = null;
        }, 200);
      }
    });
  });
}

/**
 * Initialize loading indicators
 */
export function initLoadingIndicators() {
  // Create reusable loading spinner
  window.showLoader = function (container) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="loader-spinner">
        <div></div><div></div><div></div><div></div>
      </div>
      <p>Loading...</p>
    `;

    loader.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #718096;
    `;

    // Add spinner styles
    const spinnerStyles = `
      .loader-spinner {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 40px;
        margin-bottom: 16px;
      }
      .loader-spinner div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 32px;
        height: 32px;
        margin: 4px;
        border: 3px solid #3182ce;
        border-radius: 50%;
        animation: loader-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #3182ce transparent transparent transparent;
      }
      .loader-spinner div:nth-child(1) { animation-delay: -0.45s; }
      .loader-spinner div:nth-child(2) { animation-delay: -0.3s; }
      .loader-spinner div:nth-child(3) { animation-delay: -0.15s; }
      @keyframes loader-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    if (!document.querySelector('#loader-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'loader-styles';
      styleSheet.textContent = spinnerStyles;
      document.head.appendChild(styleSheet);
    }

    if (container) {
      container.innerHTML = '';
      container.appendChild(loader);
    }

    return loader;
  };

  window.hideLoader = function (container) {
    if (container) {
      const loader = container.querySelector('.loader');
      if (loader) {
        loader.remove();
      }
    }
  };
}

/**
 * Initialize focus management for accessibility
 */
export function initFocusManagement() {
  // Track focus for keyboard navigation
  let isKeyboardNavigation = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isKeyboardNavigation = true;
    }
  });

  document.addEventListener('mousedown', () => {
    isKeyboardNavigation = false;
  });

  // Add focus styles only for keyboard navigation
  document.addEventListener('focusin', (e) => {
    if (isKeyboardNavigation) {
      e.target.classList.add('keyboard-focus');
    }
  });

  document.addEventListener('focusout', (e) => {
    e.target.classList.remove('keyboard-focus');
  });

  // Add CSS for keyboard focus
  const focusStyles = `
    .keyboard-focus {
      outline: 2px solid #3182ce !important;
      outline-offset: 2px !important;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = focusStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Initialize responsive utilities
 */
export function initResponsiveUtilities() {
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewport);
  }

  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    // Force recalculation of viewport height
    setTimeout(() => {
      window.scrollTo(window.scrollX, window.scrollY);
    }, 500);
  });

  // Add responsive helper classes
  const responsiveStyles = `
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .show-mobile { display: block !important; }
    }
    @media (min-width: 769px) {
      .hide-desktop { display: none !important; }
      .show-desktop { display: block !important; }
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = responsiveStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Initialize all UI interactions
 */
export function initAllUIInteractions() {
  initMobileMenu();
  initBackToTop();
  initButtonAnimations();
  initScrollAnimations();
  initTooltips();
  initLoadingIndicators();
  initFocusManagement();
  initResponsiveUtilities();
}
