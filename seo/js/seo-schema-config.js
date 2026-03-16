/**
 * SEO Schema Configuration
 * Centralized configuration for SEO schema management
 */

const SEO_SCHEMA_CONFIG = {
  // Site-wide settings
  site: {
    name: 'Commentator',
    description:
      'Universal Web Comments - Improve transparency on the web by enabling community-driven feedback',
    tagline: 'Community-driven feedback for the modern web',
    baseUrl: 'https://kamrankhan78694.github.io/Commentator',
    logo: '/assets/favicon.png',
    author: {
      name: 'Kamran Khan',
      type: 'Person',
    },
    organization: {
      name: 'Commentator',
      foundingDate: '2024',
      applicationCategory: 'Web Application',
    },
    social: {
      github: 'https://github.com/kamrankhan78694/Commentator',
    },
  },

  // Default schemas enabled for all pages
  universal: {
    organization: true,
    website: true,
    webApplication: true,
  },

  // Page-specific schema mappings
  pageTypes: {
    // Documentation pages
    'docs/': {
      type: 'documentation',
      defaultSchema: {
        '@type': 'TechArticle',
        audience: {
          '@type': 'Audience',
          audienceType: 'Developers',
        },
      },
    },

    // API documentation
    'docs/api.html': {
      type: 'documentation',
      defaultSchema: {
        '@type': 'APIReference',
        programmingLanguage: 'JavaScript',
      },
    },

    // FAQ page
    'docs/faq.html': {
      type: 'faq',
      defaultSchema: {
        '@type': 'FAQPage',
      },
    },

    // Getting started guide
    'docs/getting-started.html': {
      type: 'documentation',
      defaultSchema: {
        '@type': 'HowTo',
        audience: {
          '@type': 'Audience',
          audienceType: 'Developers',
        },
      },
    },

    // Security documentation
    'docs/security.html': {
      type: 'documentation',
      defaultSchema: {
        '@type': 'TechArticle',
        about: {
          '@type': 'Thing',
          name: 'Web Security',
        },
      },
    },
  },

  // Breadcrumb configurations
  breadcrumbs: {
    'docs/': [
      { name: 'Home', url: '/' },
      { name: 'Documentation', url: '/docs/' },
    ],
    'docs/api.html': [
      { name: 'Home', url: '/' },
      { name: 'Documentation', url: '/docs/' },
      { name: 'API Reference', url: '/docs/api.html' },
    ],
    'docs/getting-started.html': [
      { name: 'Home', url: '/' },
      { name: 'Documentation', url: '/docs/' },
      { name: 'Getting Started', url: '/docs/getting-started.html' },
    ],
  },

  // FAQ questions for FAQ page schema
  faqQuestions: [
    {
      '@type': 'Question',
      name: 'What is Commentator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Commentator is an open-source platform for universal web commentary that enables community-driven feedback on any website.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Commentator work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Users can attach any website URL to view and post comments about that site, creating a decentralized commenting system.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Commentator free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Commentator is completely free and open-source under the MIT license.',
      },
    },
  ],
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEO_SCHEMA_CONFIG;
} else {
  // Browser environment
  window.SEO_SCHEMA_CONFIG = SEO_SCHEMA_CONFIG;
}
