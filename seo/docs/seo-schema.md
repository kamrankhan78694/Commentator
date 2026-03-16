# SEO Schema Implementation Guide

## Overview

The Commentator project includes a comprehensive SEO schema system that automatically injects structured data markup across all pages to improve search engine understanding and indexing. The system provides both universal (site-wide) schema and page-specific schema capabilities.

## Features

- **Universal Schema**: Automatically injected on all pages
  - Organization schema
  - WebSite schema
  - WebApplication schema
- **Page-Specific Schema**: Contextual schema based on page type
  - Article schema for blog posts
  - TechArticle schema for documentation
  - APIReference schema for API docs
  - FAQPage schema for FAQ pages
  - HowTo schema for tutorials
- **Breadcrumb Schema**: Automatic breadcrumb markup for documentation
- **Easy Extension**: Simple API for adding custom schema

## Architecture

### Core Files

- `js/seo-schema.js` - Main SEO schema management class
- `js/seo-schema-config.js` - Configuration for schema settings
- `_includes/seo-schema.html` - Jekyll include for automatic schema injection

### How It Works

1. **Universal Schema**: Injected automatically on page load via `SEOSchemaManager`
2. **Page-Specific Schema**: Added based on page type and Jekyll front matter
3. **JSON-LD Format**: All schema output in valid JSON-LD format
4. **Auto-Detection**: Intelligent page type detection based on URL patterns

## Usage

### For Jekyll Pages

#### Basic Usage

Add schema type to your Jekyll page front matter:

```yaml
---
title: 'API Documentation'
schema_type: 'api'
description: 'Complete API reference for developers'
---
```

#### Supported Schema Types

- `documentation` - Technical articles and guides
- `api` - API documentation and references
- `faq` - Frequently asked questions
- `article` - General articles and blog posts

#### Custom Schema

Add custom schema data in front matter:

```yaml
---
title: 'Getting Started Guide'
schema_type: 'documentation'
schema_data:
  difficulty: 'Beginner'
  timeRequired: 'PT30M'
  audience: 'Developers'
---
```

### For JavaScript/HTML Pages

#### Basic Schema Injection

```javascript
// Initialize the schema manager
const schemaManager = initializeSEOSchema();

// Add page-specific schema
schemaManager.addPageSchema('article', {
  headline: 'My Article Title',
  description: 'Article description',
  author: 'Author Name',
});

// Inject all schemas
schemaManager.injectSchemas();
```

#### Advanced Usage

```javascript
// Add custom FAQ schema
schemaManager.addPageSchema('faq', {
  questions: [
    {
      '@type': 'Question',
      name: 'How do I get started?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Follow our getting started guide...',
      },
    },
  ],
});

// Add breadcrumb schema
const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Docs', url: '/docs/' },
  { name: 'FAQ', url: '/docs/faq.html' },
];
const breadcrumbSchema = schemaManager.generateBreadcrumbSchema(breadcrumbs);
schemaManager.addPageSchema('breadcrumb', breadcrumbSchema);
```

## Configuration

### Global Configuration

Edit `js/seo-schema-config.js` to customize site-wide settings:

```javascript
const SEO_SCHEMA_CONFIG = {
  site: {
    name: 'Your Site Name',
    description: 'Site description',
    baseUrl: 'https://yoursite.com',
    author: {
      name: 'Author Name',
    },
  },

  // Configure page type mappings
  pageTypes: {
    'docs/api.html': {
      type: 'documentation',
      defaultSchema: {
        '@type': 'APIReference',
      },
    },
  },
};
```

### Jekyll Configuration

Update `_config.yml` for Jekyll-specific settings:

```yaml
# SEO settings
seo:
  type: WebSite
  name: 'Site Name'
  links:
    - 'https://yoursite.com'
    - 'https://github.com/yourrepo'

# Default front matter for schema
defaults:
  - scope:
      path: 'docs'
    values:
      layout: 'default'
      section: 'documentation'
      schema_type: 'documentation'
```

## Schema Types Reference

### Organization Schema

Automatically included on all pages:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Commentator",
  "description": "Site description",
  "url": "https://site.com",
  "logo": "https://site.com/logo.png",
  "founder": {
    "@type": "Person",
    "name": "Founder Name"
  }
}
```

### Article Schema

For blog posts and articles:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "datePublished": "2024-01-01T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}
```

### TechArticle Schema

For technical documentation:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Tech Guide Title",
  "audience": {
    "@type": "Audience",
    "audienceType": "Developers"
  }
}
```

### FAQPage Schema

For FAQ pages:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

## Testing and Validation

### Automated Testing

The system includes validation functions:

```javascript
// Validate schema structure
const isValid = schemaManager.validateSchema(schema);

// Get all schemas for testing
const allSchemas = schemaManager.getAllSchemas();
```

### Manual Testing

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor rich results performance

### Browser Developer Tools

Check injected schema in browser:

```javascript
// View all injected schemas
document.querySelectorAll('script[type="application/ld+json"]');

// Get schema manager instance
window.seoSchemaManager.getAllSchemas();
```

## Best Practices

### Content Guidelines

1. **Be Accurate**: Ensure schema matches actual page content
2. **Stay Current**: Update dates and information regularly
3. **Be Specific**: Use the most specific schema type available
4. **Validate Often**: Test schema changes before deployment

### Performance

1. **Minimal Schemas**: Only include necessary schema types
2. **Compress Data**: Remove unnecessary whitespace from JSON-LD
3. **Async Loading**: Schema injection happens after DOM ready
4. **Cache Friendly**: Static configuration enables CDN caching

### SEO Tips

1. **Rich Snippets**: Focus on schema types that generate rich snippets
2. **Local Business**: Add LocalBusiness schema for location-based content
3. **Reviews**: Include Review/Rating schema where applicable
4. **Events**: Use Event schema for time-sensitive content

## Troubleshooting

### Common Issues

1. **Schema Not Appearing**
   - Check browser console for JavaScript errors
   - Verify script loading order
   - Ensure DOM is ready before injection

2. **Invalid Schema**
   - Validate with Schema.org validator
   - Check for missing required properties
   - Verify JSON-LD syntax

3. **Wrong Schema Type**
   - Review page type detection logic
   - Check Jekyll front matter configuration
   - Verify URL pattern matching

### Debug Mode

Enable debug logging:

```javascript
// Enable verbose logging
const schemaManager = initializeSEOSchema();
console.log(schemaManager.getAllSchemas());
```

## Extension Guide

### Adding New Schema Types

1. **Update Configuration**:

   ```javascript
   // In seo-schema-config.js
   pageTypes: {
     "events/": {
       type: "event",
       defaultSchema: {
         "@type": "Event"
       }
     }
   }
   ```

2. **Add Schema Logic**:

   ```javascript
   // In seo-schema.js addPageSchema method
   case 'event':
     schema = {
       "@context": "https://schema.org",
       "@type": "Event",
       "name": schemaData.name,
       "startDate": schemaData.startDate,
       "location": schemaData.location,
       ...schemaData
     };
     break;
   ```

3. **Update Documentation**:
   - Add new schema type to this guide
   - Include usage examples
   - Update Jekyll defaults if needed

### Custom Schema Injection

For complex custom schemas:

```javascript
class CustomSchemaManager extends SEOSchemaManager {
  addCustomSchema(type, data) {
    // Custom schema logic
    const schema = this.buildCustomSchema(type, data);
    this.pageSpecificSchemas.set(`custom-${type}`, schema);
  }
}
```

## Migration Guide

### From Manual Schema

If migrating from manual schema implementation:

1. **Audit Existing**: Document current schema usage
2. **Remove Manual**: Delete hardcoded JSON-LD scripts
3. **Configure**: Set up schema configuration
4. **Test**: Validate schema output matches previous implementation
5. **Deploy**: Gradual rollout with monitoring

### Version Updates

When updating the schema system:

1. **Backup Config**: Save current configuration
2. **Test Changes**: Validate in development environment
3. **Monitor**: Watch for search console errors after deployment
4. **Rollback Plan**: Keep previous version ready if needed

## Support

For questions or issues with the SEO schema system:

1. Check this documentation
2. Review browser console for errors
3. Test with Google's Rich Results Test
4. Open an issue in the project repository

## Contributing

To contribute improvements to the SEO schema system:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

---

_This documentation is part of the Commentator project. For general project information, see the main README._
