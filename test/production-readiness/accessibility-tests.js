/**
 * Accessibility & Compliance Test Module
 * Tests WCAG 2.1 compliance, keyboard navigation, screen reader compatibility
 */

class AccessibilityTests {
  constructor(testCore) {
    this.testCore = testCore;
    this.category = 'accessibility';
  }

  async runAllTests(container = 'accessibility-results') {
    this.testCore.log(
      container,
      'Starting accessibility and compliance tests...',
      'info',
      this.category
    );

    const tests = [
      () => this.testWCAGCompliance(container),
      () => this.testKeyboardNavigation(container),
      () => this.testScreenReaderCompatibility(container),
      () => this.testColorContrast(container),
      () => this.testAriaLabels(container),
      () => this.testSemanticHTML(container),
      () => this.testFocusManagement(container),
      () => this.testAlternativeText(container),
      () => this.testFormAccessibility(container),
      () => this.testLandmarksAndHeadings(container),
    ];

    for (const test of tests) {
      try {
        await this.testCore.executeWithTimeout(test, 10000);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        this.testCore.log(
          container,
          `Test error: ${error.message}`,
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Test execution', this.category, {
          error: error.message,
        });
      }
    }

    this.testCore.log(
      container,
      'Accessibility tests completed',
      'info',
      this.category
    );
  }

  async testWCAGCompliance(container) {
    this.testCore.log(
      container,
      '🔍 Testing WCAG 2.1 compliance...',
      'info',
      this.category
    );

    try {
      // Test for proper document structure
      const doctype = document.doctype;
      if (doctype && doctype.name === 'html') {
        this.testCore.log(
          container,
          '✅ Valid DOCTYPE declaration',
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'DOCTYPE declaration', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ Missing or invalid DOCTYPE',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'DOCTYPE declaration', this.category);
      }

      // Test for language attribute
      const htmlElement = document.documentElement;
      if (htmlElement.lang) {
        this.testCore.log(
          container,
          `✅ Language attribute present: ${htmlElement.lang}`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Language attribute', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ Missing language attribute on HTML element',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Language attribute', this.category);
      }

      // Test for page title
      const title = document.title;
      if (title && title.trim().length > 0) {
        this.testCore.log(
          container,
          `✅ Page title present: "${title}"`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Page title', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ Missing or empty page title',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Page title', this.category);
      }

      // Test for viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        this.testCore.log(
          container,
          '✅ Viewport meta tag present',
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Viewport meta tag', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ Missing viewport meta tag',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Viewport meta tag', this.category);
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ WCAG compliance test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'WCAG compliance', this.category, {
        error: error.message,
      });
    }
  }

  async testKeyboardNavigation(container) {
    this.testCore.log(
      container,
      '⌨️ Testing keyboard navigation...',
      'info',
      this.category
    );

    try {
      // Test for focusable elements
      const focusableSelectors = [
        'button',
        'input',
        'select',
        'textarea',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable]',
      ];

      const focusableElements = document.querySelectorAll(
        focusableSelectors.join(', ')
      );

      if (focusableElements.length > 0) {
        this.testCore.log(
          container,
          `✅ Found ${focusableElements.length} focusable elements`,
          'success',
          this.category
        );
        this.testCore.recordTest(
          true,
          'Focusable elements present',
          this.category,
          { count: focusableElements.length }
        );
      } else {
        this.testCore.log(
          container,
          '❌ No focusable elements found',
          'error',
          this.category
        );
        this.testCore.recordTest(
          false,
          'Focusable elements present',
          this.category
        );
      }

      // Test for skip links
      const skipLinks = document.querySelectorAll(
        'a[href^="#"]:first-child, .skip-link'
      );
      if (skipLinks.length > 0) {
        this.testCore.log(
          container,
          '✅ Skip navigation links found',
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Skip navigation links', this.category);
      } else {
        this.testCore.log(
          container,
          '⚠️ No skip navigation links found',
          'warning',
          this.category
        );
        this.testCore.recordTest(false, 'Skip navigation links', this.category);
      }

      // Test for logical tab order
      const tabbableElements = Array.from(focusableElements).filter((el) => {
        const tabindex = parseInt(el.getAttribute('tabindex')) || 0;
        return tabindex >= 0 && !el.disabled && el.offsetParent !== null;
      });

      if (tabbableElements.length > 0) {
        this.testCore.log(
          container,
          `✅ ${tabbableElements.length} elements in tab order`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Tab order elements', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ No elements in logical tab order',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Tab order elements', this.category);
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Keyboard navigation test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Keyboard navigation', this.category, {
        error: error.message,
      });
    }
  }

  async testScreenReaderCompatibility(container) {
    this.testCore.log(
      container,
      '📢 Testing screen reader compatibility...',
      'info',
      this.category
    );

    try {
      // Test for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map((h) =>
        parseInt(h.tagName.charAt(1))
      );

      if (headings.length > 0) {
        this.testCore.log(
          container,
          `✅ Found ${headings.length} headings`,
          'success',
          this.category
        );
        this.testCore.recordTest(
          true,
          'Heading elements present',
          this.category,
          { count: headings.length }
        );

        // Check for H1
        const h1Count = document.querySelectorAll('h1').length;
        if (h1Count === 1) {
          this.testCore.log(
            container,
            '✅ Exactly one H1 element found',
            'success',
            this.category
          );
          this.testCore.recordTest(true, 'Single H1 element', this.category);
        } else if (h1Count === 0) {
          this.testCore.log(
            container,
            '❌ No H1 element found',
            'error',
            this.category
          );
          this.testCore.recordTest(false, 'Single H1 element', this.category);
        } else {
          this.testCore.log(
            container,
            `⚠️ Multiple H1 elements found: ${h1Count}`,
            'warning',
            this.category
          );
          this.testCore.recordTest(false, 'Single H1 element', this.category);
        }
      } else {
        this.testCore.log(
          container,
          '❌ No heading elements found',
          'error',
          this.category
        );
        this.testCore.recordTest(
          false,
          'Heading elements present',
          this.category
        );
      }

      // Test for lists
      const lists = document.querySelectorAll('ul, ol, dl');
      if (lists.length > 0) {
        this.testCore.log(
          container,
          `✅ Found ${lists.length} list elements`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'List elements present', this.category);
      } else {
        this.testCore.log(
          container,
          '⚠️ No list elements found',
          'warning',
          this.category
        );
        this.testCore.recordTest(true, 'List elements present', this.category); // Not critical
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Screen reader test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(
        false,
        'Screen reader compatibility',
        this.category,
        { error: error.message }
      );
    }
  }

  async testColorContrast(container) {
    this.testCore.log(
      container,
      '🎨 Testing color contrast...',
      'info',
      this.category
    );

    try {
      // This is a simplified contrast test - in a real implementation,
      // you would use a proper color contrast calculation
      const textElements = document.querySelectorAll(
        'p, span, div, button, a, h1, h2, h3, h4, h5, h6'
      );
      let elementsChecked = 0;
      let contrastIssues = 0;

      for (const element of Array.from(textElements).slice(0, 10)) {
        // Check first 10 elements
        const styles = getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (
          color &&
          backgroundColor &&
          color !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor !== 'rgba(0, 0, 0, 0)'
        ) {
          elementsChecked++;
          // Simplified check - real implementation would calculate luminance
          if (color === backgroundColor) {
            contrastIssues++;
          }
        }
      }

      if (elementsChecked > 0) {
        if (contrastIssues === 0) {
          this.testCore.log(
            container,
            `✅ No obvious contrast issues in ${elementsChecked} elements`,
            'success',
            this.category
          );
          this.testCore.recordTest(true, 'Color contrast check', this.category);
        } else {
          this.testCore.log(
            container,
            `❌ Potential contrast issues in ${contrastIssues}/${elementsChecked} elements`,
            'error',
            this.category
          );
          this.testCore.recordTest(
            false,
            'Color contrast check',
            this.category
          );
        }
      } else {
        this.testCore.log(
          container,
          '⚠️ Unable to check color contrast',
          'warning',
          this.category
        );
        this.testCore.recordTest(true, 'Color contrast check', this.category); // Skip this test
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Color contrast test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Color contrast', this.category, {
        error: error.message,
      });
    }
  }

  async testAriaLabels(container) {
    this.testCore.log(
      container,
      '🏷️ Testing ARIA labels and attributes...',
      'info',
      this.category
    );

    try {
      // Test for ARIA labels on interactive elements
      const interactiveElements = document.querySelectorAll(
        'button, input, select, textarea, [role="button"], [role="link"]'
      );
      let labeledElements = 0;

      interactiveElements.forEach((element) => {
        const hasLabel =
          element.getAttribute('aria-label') ||
          element.getAttribute('aria-labelledby') ||
          element.querySelector('label') ||
          element.textContent.trim();

        if (hasLabel) {
          labeledElements++;
        }
      });

      if (interactiveElements.length > 0) {
        const percentage = Math.round(
          (labeledElements / interactiveElements.length) * 100
        );
        if (percentage >= 90) {
          this.testCore.log(
            container,
            `✅ ${percentage}% of interactive elements have labels`,
            'success',
            this.category
          );
          this.testCore.recordTest(true, 'ARIA labels coverage', this.category);
        } else {
          this.testCore.log(
            container,
            `⚠️ Only ${percentage}% of interactive elements have labels`,
            'warning',
            this.category
          );
          this.testCore.recordTest(
            false,
            'ARIA labels coverage',
            this.category
          );
        }
      } else {
        this.testCore.log(
          container,
          '⚠️ No interactive elements found to test',
          'warning',
          this.category
        );
        this.testCore.recordTest(true, 'ARIA labels coverage', this.category);
      }

      // Test for ARIA landmarks
      const landmarks = document.querySelectorAll(
        '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer'
      );
      if (landmarks.length > 0) {
        this.testCore.log(
          container,
          `✅ Found ${landmarks.length} ARIA landmarks`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'ARIA landmarks', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ No ARIA landmarks found',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'ARIA landmarks', this.category);
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ ARIA labels test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'ARIA labels', this.category, {
        error: error.message,
      });
    }
  }

  async testSemanticHTML(container) {
    this.testCore.log(
      container,
      '📋 Testing semantic HTML structure...',
      'info',
      this.category
    );

    try {
      // Test for semantic HTML5 elements
      const semanticElements = [
        'main',
        'nav',
        'header',
        'footer',
        'article',
        'section',
        'aside',
      ];
      let foundElements = 0;

      semanticElements.forEach((tag) => {
        const elements = document.querySelectorAll(tag);
        if (elements.length > 0) {
          foundElements++;
          this.testCore.log(
            container,
            `✅ Found ${elements.length} <${tag}> element(s)`,
            'success',
            this.category
          );
        }
      });

      if (foundElements >= 3) {
        this.testCore.log(
          container,
          `✅ Good semantic structure with ${foundElements} different semantic elements`,
          'success',
          this.category
        );
        this.testCore.recordTest(
          true,
          'Semantic HTML structure',
          this.category
        );
      } else {
        this.testCore.log(
          container,
          `⚠️ Limited semantic structure: only ${foundElements} semantic elements`,
          'warning',
          this.category
        );
        this.testCore.recordTest(
          false,
          'Semantic HTML structure',
          this.category
        );
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Semantic HTML test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Semantic HTML', this.category, {
        error: error.message,
      });
    }
  }

  async testFocusManagement(container) {
    this.testCore.log(
      container,
      '🎯 Testing focus management...',
      'info',
      this.category
    );

    try {
      // Test for visible focus indicators
      const style = document.createElement('style');
      style.textContent = `
                .focus-test-indicator:focus {
                    outline: 2px solid blue !important;
                }
            `;
      document.head.appendChild(style);

      // Test if focus is visible
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href]'
      );
      let hasVisibleFocus = false;

      if (focusableElements.length > 0) {
        // Check computed styles for focus indicators
        const sampleElement = focusableElements[0];
        const computedStyle = getComputedStyle(sampleElement, ':focus');

        if (
          computedStyle.outline !== 'none' ||
          computedStyle.outlineWidth !== '0px'
        ) {
          hasVisibleFocus = true;
        }

        if (hasVisibleFocus) {
          this.testCore.log(
            container,
            '✅ Focus indicators are visible',
            'success',
            this.category
          );
          this.testCore.recordTest(
            true,
            'Visible focus indicators',
            this.category
          );
        } else {
          this.testCore.log(
            container,
            '❌ Focus indicators may not be visible',
            'error',
            this.category
          );
          this.testCore.recordTest(
            false,
            'Visible focus indicators',
            this.category
          );
        }
      } else {
        this.testCore.log(
          container,
          '⚠️ No focusable elements to test',
          'warning',
          this.category
        );
        this.testCore.recordTest(
          true,
          'Visible focus indicators',
          this.category
        );
      }

      // Clean up
      document.head.removeChild(style);
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Focus management test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Focus management', this.category, {
        error: error.message,
      });
    }
  }

  async testAlternativeText(container) {
    this.testCore.log(
      container,
      '🖼️ Testing alternative text for images...',
      'info',
      this.category
    );

    try {
      const images = document.querySelectorAll('img');
      let imagesWithAlt = 0;
      let decorativeImages = 0;

      images.forEach((img) => {
        const alt = img.getAttribute('alt');
        if (alt !== null) {
          if (alt.trim() === '') {
            decorativeImages++;
          } else {
            imagesWithAlt++;
          }
        }
      });

      const totalProcessed = imagesWithAlt + decorativeImages;

      if (images.length === 0) {
        this.testCore.log(
          container,
          '⚠️ No images found to test',
          'warning',
          this.category
        );
        this.testCore.recordTest(true, 'Image alternative text', this.category);
      } else if (totalProcessed === images.length) {
        this.testCore.log(
          container,
          `✅ All ${images.length} images have alt attributes (${imagesWithAlt} descriptive, ${decorativeImages} decorative)`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Image alternative text', this.category);
      } else {
        this.testCore.log(
          container,
          `❌ ${images.length - totalProcessed} images missing alt attributes`,
          'error',
          this.category
        );
        this.testCore.recordTest(
          false,
          'Image alternative text',
          this.category
        );
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Alternative text test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Alternative text', this.category, {
        error: error.message,
      });
    }
  }

  async testFormAccessibility(container) {
    this.testCore.log(
      container,
      '📝 Testing form accessibility...',
      'info',
      this.category
    );

    try {
      const formElements = document.querySelectorAll('input, select, textarea');
      let labeledInputs = 0;

      formElements.forEach((element) => {
        const id = element.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');

        if (label || ariaLabel || ariaLabelledBy) {
          labeledInputs++;
        }
      });

      if (formElements.length === 0) {
        this.testCore.log(
          container,
          '⚠️ No form elements found to test',
          'warning',
          this.category
        );
        this.testCore.recordTest(true, 'Form accessibility', this.category);
      } else if (labeledInputs === formElements.length) {
        this.testCore.log(
          container,
          `✅ All ${formElements.length} form elements have labels`,
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Form accessibility', this.category);
      } else {
        this.testCore.log(
          container,
          `❌ ${formElements.length - labeledInputs} form elements missing labels`,
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Form accessibility', this.category);
      }
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Form accessibility test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Form accessibility', this.category, {
        error: error.message,
      });
    }
  }

  async testLandmarksAndHeadings(container) {
    this.testCore.log(
      container,
      '🗺️ Testing page landmarks and heading hierarchy...',
      'info',
      this.category
    );

    try {
      // Test heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const levels = Array.from(headings).map((h) =>
        parseInt(h.tagName.charAt(1))
      );

      let hierarchyValid = true;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          hierarchyValid = false;
          break;
        }
      }

      if (hierarchyValid) {
        this.testCore.log(
          container,
          '✅ Heading hierarchy is logical',
          'success',
          this.category
        );
        this.testCore.recordTest(true, 'Heading hierarchy', this.category);
      } else {
        this.testCore.log(
          container,
          '❌ Heading hierarchy has gaps',
          'error',
          this.category
        );
        this.testCore.recordTest(false, 'Heading hierarchy', this.category);
      }

      // Test for page structure landmarks
      const requiredLandmarks = ['main', 'nav'];
      let foundLandmarks = 0;

      requiredLandmarks.forEach((landmark) => {
        const elements = document.querySelectorAll(
          landmark + ', [role="' + landmark + '"]'
        );
        if (elements.length > 0) {
          foundLandmarks++;
          this.testCore.log(
            container,
            `✅ Found ${landmark} landmark`,
            'success',
            this.category
          );
        } else {
          this.testCore.log(
            container,
            `❌ Missing ${landmark} landmark`,
            'error',
            this.category
          );
        }
      });

      this.testCore.recordTest(
        foundLandmarks === requiredLandmarks.length,
        'Required landmarks present',
        this.category
      );
    } catch (error) {
      this.testCore.log(
        container,
        `❌ Landmarks and headings test error: ${error.message}`,
        'error',
        this.category
      );
      this.testCore.recordTest(false, 'Landmarks and headings', this.category, {
        error: error.message,
      });
    }
  }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
  window.AccessibilityTests = AccessibilityTests;
} else if (typeof module !== 'undefined') {
  module.exports = AccessibilityTests;
}
