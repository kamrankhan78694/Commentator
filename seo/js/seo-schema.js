/**
 * SEO Schema Management Module
 * Handles universal and page-specific SEO schema injection
 */

// Check if we're in Node.js or browser environment
const isBrowser = typeof window !== 'undefined';

class SEOSchemaManager {
  constructor() {
    this.universalSchema = this.getUniversalSchema();
    this.pageSpecificSchemas = new Map();
  }

  /**
   * Get universal schema that applies to all pages
   * @returns {Array} Array of schema objects
   */
  getUniversalSchema() {
    const baseUrl = this.getBaseUrl();

    return [
      // Organization Schema
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Commentator',
        description:
          'Universal Web Comments - Improve transparency on the web by enabling community-driven feedback',
        url: baseUrl,
        logo: `${baseUrl}/assets/favicon.png`,
        sameAs: ['https://github.com/kamrankhan78694/Commentator'],
        founder: {
          '@type': 'Person',
          name: 'Kamran Khan',
        },
        foundingDate: '2024',
        applicationCategory: 'Web Application',
        operatingSystem: 'Web Browser',
      },
      // WebSite Schema
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Commentator',
        description:
          'A disruptive, open-source platform for universal web commentary. Liberating the web through decentralized, community-driven feedback.',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}?url={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        author: {
          '@type': 'Person',
          name: 'Kamran Khan',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Commentator',
        },
      },
      // WebApplication Schema
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Commentator',
        description: 'Community-driven feedback for the modern web',
        url: baseUrl,
        applicationCategory: 'Social Media Application',
        operatingSystem: 'Web Browser',
        permissions: 'Read, Write',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Kamran Khan',
        },
      },
    ];
  }

  /**
   * Get base URL for the site
   * @returns {string} Base URL
   */
  getBaseUrl() {
    // Try to get from Jekyll config if available
    if (isBrowser && window.location) {
      const { protocol, hostname, port } = window.location;
      const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;

      // Handle GitHub Pages URLs
      if (hostname.includes('github.io')) {
        return `${baseUrl}/Commentator`;
      }

      return baseUrl;
    }

    // Fallback to production URL
    return 'https://kamrankhan78694.github.io/Commentator';
  }

  /**
   * Add page-specific schema
   * @param {string} pageType - Type of page (article, product, faq, etc.)
   * @param {Object} schemaData - Page-specific schema data
   */
  addPageSchema(pageType, schemaData) {
    const baseUrl = this.getBaseUrl();
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : baseUrl;

    let schema = {};

    switch (pageType) {
    case 'article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: schemaData.headline || document.title,
        description: schemaData.description || this.getMetaDescription(),
        url: currentUrl,
        datePublished: schemaData.datePublished || new Date().toISOString(),
        dateModified: schemaData.dateModified || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: schemaData.author || 'Commentator Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Commentator',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/assets/favicon.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl,
        },
        ...schemaData,
      };
      break;

    case 'faq':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: schemaData.questions || [],
        url: currentUrl,
        name: schemaData.name || document.title,
        description: schemaData.description || this.getMetaDescription(),
        ...schemaData,
      };
      break;

    case 'software':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: schemaData.name || 'Commentator',
        description:
            schemaData.description || 'Universal Web Comments Platform',
        url: currentUrl,
        applicationCategory: 'Social Media Application',
        operatingSystem: 'Web Browser',
        downloadUrl: 'https://github.com/kamrankhan78694/Commentator',
        author: {
          '@type': 'Person',
          name: 'Kamran Khan',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        ...schemaData,
      };
      break;

    case 'documentation':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: schemaData.headline || document.title,
        description: schemaData.description || this.getMetaDescription(),
        url: currentUrl,
        datePublished: schemaData.datePublished || new Date().toISOString(),
        dateModified: schemaData.dateModified || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'Commentator Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Commentator',
        },
        audience: {
          '@type': 'Audience',
          audienceType: 'Developers',
        },
        ...schemaData,
      };
      break;

    default:
      // Custom schema - use as provided
      schema = {
        '@context': 'https://schema.org',
        url: currentUrl,
        ...schemaData,
      };
    }

    this.pageSpecificSchemas.set(pageType, schema);
    return schema;
  }

  /**
   * Get meta description from the page
   * @returns {string} Meta description
   */
  getMetaDescription() {
    if (isBrowser && document) {
      const metaDesc = document.querySelector('meta[name="description"]');
      return metaDesc ? metaDesc.getAttribute('content') : '';
    }
    return 'Universal Web Comments - Improve transparency on the web by enabling community-driven feedback';
  }

  /**
   * Generate breadcrumb schema for documentation pages
   * @param {Array} breadcrumbs - Array of breadcrumb items
   * @returns {Object} Breadcrumb schema
   */
  generateBreadcrumbSchema(breadcrumbs) {
    const baseUrl = this.getBaseUrl();

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http')
          ? crumb.url
          : `${baseUrl}${crumb.url}`,
      })),
    };
  }

  /**
   * Inject all schemas into the page
   */
  injectSchemas() {
    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll(
      'script[type="application/ld+json"][data-schema-manager]'
    );
    existingSchemas.forEach((script) => script.remove());

    // Inject universal schemas
    this.universalSchema.forEach((schema, index) => {
      this.injectSchema(schema, `universal-${index}`);
    });

    // Inject page-specific schemas
    this.pageSpecificSchemas.forEach((schema, type) => {
      this.injectSchema(schema, `page-${type}`);
    });
  }

  /**
   * Inject a single schema into the page
   * @param {Object} schema - Schema object
   * @param {string} id - Unique identifier for the schema
   */
  injectSchema(schema, id) {
    if (!isBrowser || !document) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-manager', 'true');
    script.setAttribute('data-schema-id', id);
    script.textContent = JSON.stringify(schema);

    document.head.appendChild(script);
  }

  /**
   * Remove all injected schemas
   */
  removeAllSchemas() {
    if (!isBrowser || !document) return;

    const schemas = document.querySelectorAll(
      'script[type="application/ld+json"][data-schema-manager]'
    );
    schemas.forEach((script) => script.remove());
    this.pageSpecificSchemas.clear();
  }

  /**
   * Get all current schemas (for debugging/validation)
   * @returns {Array} Array of all current schemas
   */
  getAllSchemas() {
    const allSchemas = [...this.universalSchema];
    this.pageSpecificSchemas.forEach((schema) => {
      allSchemas.push(schema);
    });
    return allSchemas;
  }

  /**
   * Validate schema structure (basic validation)
   * @param {Object} schema - Schema to validate
   * @returns {boolean} Whether schema is valid
   */
  validateSchema(schema) {
    return (
      schema &&
      typeof schema === 'object' &&
      schema['@context'] &&
      schema['@type']
    );
  }
}

// Global instance
let seoSchemaManager = null;

/**
 * Initialize SEO Schema Manager
 * @returns {SEOSchemaManager} Schema manager instance
 */
function initializeSEOSchema() {
  if (!seoSchemaManager) {
    seoSchemaManager = new SEOSchemaManager();
  }
  return seoSchemaManager;
}

/**
 * Auto-inject schemas when DOM is ready
 */
function autoInjectSchemas() {
  if (isBrowser && document) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const manager = initializeSEOSchema();
        manager.injectSchemas();
      });
    } else {
      const manager = initializeSEOSchema();
      manager.injectSchemas();
    }
  }
}

// Export for both browser and Node.js environments
// ES modules export
export { SEOSchemaManager, initializeSEOSchema };

// Browser environment
if (typeof window !== 'undefined') {
  console.log('SEO Schema: Setting up browser environment...');
  // Browser environment - attach to window
  window.SEOSchemaManager = SEOSchemaManager;
  window.initializeSEOSchema = initializeSEOSchema;
  window.seoSchemaManager = seoSchemaManager;

  // Auto-initialize
  autoInjectSchemas();
}
