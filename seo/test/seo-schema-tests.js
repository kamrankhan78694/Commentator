/**
 * SEO Schema Tests
 * Tests for the SEO schema injection system
 */

// Mock browser environment for Node.js testing
if (typeof window === 'undefined') {
  global.window = {
    location: {
      href: 'https://kamrankhan78694.github.io/Commentator',
      hostname: 'kamrankhan78694.github.io',
      pathname: '/',
      protocol: 'https:',
    },
  };
  global.document = {
    title: 'Commentator - Test Page',
    querySelector: (selector) => {
      if (selector === 'meta[name="description"]') {
        return { getAttribute: () => 'Test description for SEO schema' };
      }
      return null;
    },
    querySelectorAll: () => [],
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
    }),
    head: {
      appendChild: () => {},
    },
    readyState: 'complete',
    addEventListener: () => {},
  };
}

// Import the SEO schema module
let SEOSchemaManager;
try {
  // Try ES modules (Node.js with type: "module")
  const module = await import('../js/seo-schema.js');
  SEOSchemaManager = module.SEOSchemaManager;
} catch (error) {
  // Fallback for CommonJS or browser
  if (typeof window !== 'undefined' && window.SEOSchemaManager) {
    SEOSchemaManager = window.SEOSchemaManager;
  } else {
    console.error('Could not load SEO Schema module:', error.message);
    process.exit(1);
  }
}

/**
 * Test suite for SEO Schema functionality
 */
const SEOSchemaTests = {
  /**
   * Test universal schema generation
   */
  testUniversalSchema() {
    console.log('🧪 Testing universal schema generation...');

    const manager = new SEOSchemaManager();
    const universalSchema = manager.getUniversalSchema();

    // Test that we have the expected schema types
    const schemaTypes = universalSchema.map((schema) => schema['@type']);
    const expectedTypes = ['Organization', 'WebSite', 'WebApplication'];

    for (const expectedType of expectedTypes) {
      if (!schemaTypes.includes(expectedType)) {
        throw new Error(`Missing expected schema type: ${expectedType}`);
      }
    }

    // Test Organization schema structure
    const orgSchema = universalSchema.find(
      (s) => s['@type'] === 'Organization'
    );
    if (!orgSchema.name || !orgSchema.url || !orgSchema.description) {
      throw new Error('Organization schema missing required fields');
    }

    // Test WebSite schema structure
    const websiteSchema = universalSchema.find((s) => s['@type'] === 'WebSite');
    if (
      !websiteSchema.name ||
      !websiteSchema.url ||
      !websiteSchema.potentialAction
    ) {
      throw new Error('WebSite schema missing required fields');
    }

    console.log('✅ Universal schema generation test passed');
    return true;
  },

  /**
   * Test page-specific schema addition
   */
  testPageSpecificSchema() {
    console.log('🧪 Testing page-specific schema addition...');

    const manager = new SEOSchemaManager();

    // Test Article schema
    const articleSchema = manager.addPageSchema('article', {
      headline: 'Test Article',
      author: 'Test Author',
    });

    if (articleSchema['@type'] !== 'Article') {
      throw new Error('Article schema type incorrect');
    }

    if (!articleSchema.headline || !articleSchema.author) {
      throw new Error('Article schema missing custom fields');
    }

    // Test FAQ schema
    const faqSchema = manager.addPageSchema('faq', {
      questions: [
        {
          '@type': 'Question',
          name: 'Test question?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Test answer',
          },
        },
      ],
    });

    if (faqSchema['@type'] !== 'FAQPage') {
      throw new Error('FAQ schema type incorrect');
    }

    if (!faqSchema.mainEntity || !Array.isArray(faqSchema.mainEntity)) {
      throw new Error('FAQ schema missing questions array');
    }

    console.log('✅ Page-specific schema addition test passed');
    return true;
  },

  /**
   * Test breadcrumb schema generation
   */
  testBreadcrumbSchema() {
    console.log('🧪 Testing breadcrumb schema generation...');

    const manager = new SEOSchemaManager();
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Docs', url: '/docs/' },
      { name: 'API', url: '/docs/api.html' },
    ];

    const breadcrumbSchema = manager.generateBreadcrumbSchema(breadcrumbs);

    if (breadcrumbSchema['@type'] !== 'BreadcrumbList') {
      throw new Error('Breadcrumb schema type incorrect');
    }

    if (!Array.isArray(breadcrumbSchema.itemListElement)) {
      throw new Error('Breadcrumb schema missing itemListElement array');
    }

    if (breadcrumbSchema.itemListElement.length !== 3) {
      throw new Error('Breadcrumb schema incorrect number of items');
    }

    // Test breadcrumb item structure
    const firstItem = breadcrumbSchema.itemListElement[0];
    if (firstItem.position !== 1 || !firstItem.name || !firstItem.item) {
      throw new Error('Breadcrumb item structure incorrect');
    }

    console.log('✅ Breadcrumb schema generation test passed');
    return true;
  },

  /**
   * Test schema validation
   */
  testSchemaValidation() {
    console.log('🧪 Testing schema validation...');

    const manager = new SEOSchemaManager();

    // Test valid schema
    const validSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test',
    };

    if (!manager.validateSchema(validSchema)) {
      throw new Error('Valid schema failed validation');
    }

    // Test invalid schema - missing @context
    const invalidSchema1 = {
      '@type': 'Article',
      headline: 'Test',
    };

    if (manager.validateSchema(invalidSchema1)) {
      throw new Error('Invalid schema (missing @context) passed validation');
    }

    // Test invalid schema - missing @type
    const invalidSchema2 = {
      '@context': 'https://schema.org',
      headline: 'Test',
    };

    if (manager.validateSchema(invalidSchema2)) {
      throw new Error('Invalid schema (missing @type) passed validation');
    }

    console.log('✅ Schema validation test passed');
    return true;
  },

  /**
   * Test base URL generation
   */
  testBaseUrlGeneration() {
    console.log('🧪 Testing base URL generation...');

    const manager = new SEOSchemaManager();
    const baseUrl = manager.getBaseUrl();

    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('Base URL not generated correctly');
    }

    // Test that it's a valid URL format
    if (!baseUrl.startsWith('http')) {
      throw new Error('Base URL not in correct format');
    }

    console.log('✅ Base URL generation test passed');
    return true;
  },

  /**
   * Test all schemas retrieval
   */
  testGetAllSchemas() {
    console.log('🧪 Testing getAllSchemas functionality...');

    const manager = new SEOSchemaManager();

    // Add some page-specific schemas
    manager.addPageSchema('article', { headline: 'Test Article' });
    manager.addPageSchema('faq', { questions: [] });

    const allSchemas = manager.getAllSchemas();

    if (!Array.isArray(allSchemas)) {
      throw new Error('getAllSchemas should return an array');
    }

    // Should have universal schemas + page-specific schemas
    if (allSchemas.length < 5) {
      // 3 universal + 2 page-specific
      throw new Error('getAllSchemas not returning all schemas');
    }

    console.log('✅ getAllSchemas functionality test passed');
    return true;
  },

  /**
   * Test documentation-specific schema
   */
  testDocumentationSchema() {
    console.log('🧪 Testing documentation-specific schema...');

    const manager = new SEOSchemaManager();

    const docSchema = manager.addPageSchema('documentation', {
      headline: 'API Documentation',
      description: 'Complete API reference',
    });

    if (docSchema['@type'] !== 'TechArticle') {
      throw new Error('Documentation schema type should be TechArticle');
    }

    if (
      !docSchema.audience ||
      docSchema.audience.audienceType !== 'Developers'
    ) {
      throw new Error('Documentation schema missing audience information');
    }

    console.log('✅ Documentation-specific schema test passed');
    return true;
  },

  /**
   * Test software application schema
   */
  testSoftwareSchema() {
    console.log('🧪 Testing software application schema...');

    const manager = new SEOSchemaManager();

    const softwareSchema = manager.addPageSchema('software', {
      name: 'Commentator',
      description: 'Universal commenting platform',
    });

    if (softwareSchema['@type'] !== 'SoftwareApplication') {
      throw new Error('Software schema type incorrect');
    }

    if (!softwareSchema.offers || softwareSchema.offers.price !== '0') {
      throw new Error('Software schema should indicate free application');
    }

    console.log('✅ Software application schema test passed');
    return true;
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Running SEO Schema Tests...\n');

    const tests = [
      'testUniversalSchema',
      'testPageSpecificSchema',
      'testBreadcrumbSchema',
      'testSchemaValidation',
      'testBaseUrlGeneration',
      'testGetAllSchemas',
      'testDocumentationSchema',
      'testSoftwareSchema',
    ];

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const testName of tests) {
      try {
        this[testName]();
        passed++;
      } catch (error) {
        failed++;
        failures.push({ test: testName, error: error.message });
        console.log(`❌ ${testName} failed: ${error.message}`);
      }
    }

    console.log('\n📊 SEO Schema Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${tests.length}`);

    if (failures.length > 0) {
      console.log('\n🚨 Failed Tests:');
      failures.forEach((failure) => {
        console.log(`  - ${failure.test}: ${failure.error}`);
      });
    }

    return { passed, failed, total: tests.length, failures };
  },
};

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOSchemaTests;
} else {
  // Browser environment
  window.SEOSchemaTests = SEOSchemaTests;
}

// Auto-run tests if this file is executed directly in Node.js
if (
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv[1] &&
  process.argv[1].includes('seo-schema-tests.js')
) {
  SEOSchemaTests.runAllTests()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}
