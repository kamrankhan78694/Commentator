/**
 * Forms Module
 *
 * Handles form validation, email validation, newsletter subscription,
 * notifications, and accessibility validation for the Commentator application.
 *
 * @module Forms
 */

/**
 * Initialize newsletter form functionality
 */
export function initNewsletterForm() {
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
export function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
export function showNotification(message, type = 'success') {
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

/**
 * Basic accessibility validation
 * @returns {Array} - Array of accessibility issues found
 */
export function validateAccessibility() {
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
 * Initialize form styles by injecting CSS
 */
export function initFormStyles() {
  // Add styles for notifications and forms
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
}

/**
 * Generic form validation utility
 * @param {HTMLFormElement} form - The form to validate
 * @param {Object} validationRules - Rules for validation
 * @returns {Object} - Validation result with success status and errors
 */
export function validateForm(form, validationRules = {}) {
  const errors = [];
  const formData = new FormData(form);

  // Loop through validation rules
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData.get(fieldName);
    const field = form.querySelector(`[name="${fieldName}"]`);

    if (rules.required && (!value || value.trim() === '')) {
      errors.push({
        field: fieldName,
        message: rules.required.message || `${fieldName} is required`,
        element: field,
      });
      continue;
    }

    if (value) {
      // Email validation
      if (rules.email && !isValidEmail(value)) {
        errors.push({
          field: fieldName,
          message: rules.email.message || 'Invalid email format',
          element: field,
        });
      }

      // Min length validation
      if (rules.minLength && value.length < rules.minLength.value) {
        errors.push({
          field: fieldName,
          message:
            rules.minLength.message ||
            `Minimum ${rules.minLength.value} characters required`,
          element: field,
        });
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength.value) {
        errors.push({
          field: fieldName,
          message:
            rules.maxLength.message ||
            `Maximum ${rules.maxLength.value} characters allowed`,
          element: field,
        });
      }

      // Custom validation
      if (rules.custom && !rules.custom.validate(value)) {
        errors.push({
          field: fieldName,
          message: rules.custom.message || 'Invalid value',
          element: field,
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    errors: errors,
    data: formData,
  };
}

/**
 * Display form validation errors
 * @param {Array} errors - Array of validation errors
 */
export function displayFormErrors(errors) {
  // Clear existing error messages
  document.querySelectorAll('.form-error').forEach((el) => el.remove());

  errors.forEach((error) => {
    if (error.element) {
      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      errorElement.textContent = error.message;
      errorElement.style.cssText = `
                color: #e53e3e;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            `;

      // Insert error message after the field
      error.element.parentNode.insertBefore(
        errorElement,
        error.element.nextSibling
      );

      // Add error styling to field
      error.element.style.borderColor = '#e53e3e';
    }
  });
}

/**
 * Clear form validation errors
 * @param {HTMLFormElement} form - The form to clear errors from
 */
export function clearFormErrors(form) {
  // Remove error messages
  form.querySelectorAll('.form-error').forEach((el) => el.remove());

  // Reset field styling
  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.style.borderColor = '';
  });
}
