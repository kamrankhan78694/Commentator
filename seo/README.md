# SEO Schema System

This directory contains all SEO-related files for the Commentator project.

## Directory Structure

```
seo/
├── js/                     # JavaScript modules
│   ├── seo-schema.js       # Main SEO schema management class
│   └── seo-schema-config.js # Configuration for schema settings
├── includes/               # Jekyll includes
│   └── seo-schema.html     # Jekyll include for automatic schema injection
├── docs/                   # Documentation
│   └── seo-schema.md       # Comprehensive developer documentation
├── test/                   # Tests
│   └── seo-schema-tests.js # Complete test suite
└── README.md              # This file
```

## Overview

The SEO schema system provides:

- **Universal Schema**: Automatically injected on all pages (Organization, WebSite, WebApplication)
- **Page-Specific Schema**: Support for Article, TechArticle, APIReference, FAQPage, HowTo, and Breadcrumb schemas
- **Jekyll Integration**: Seamless integration with existing Jekyll setup
- **Easy Extension**: Simple API for adding custom schemas

## Usage

The system is automatically loaded via the Jekyll include in `_includes/head.html`:

```html
{%- include seo/includes/seo-schema.html -%}
```

For non-Jekyll pages, include the scripts directly:

```html
<script src="seo/js/seo-schema-config.js"></script>
<script src="seo/js/seo-schema.js"></script>
```

## Testing

Run SEO schema tests:

```bash
node seo/test/seo-schema-tests.js
```

Or run all tests (includes SEO tests automatically):

```bash
npm test
```

## Documentation

See `docs/seo-schema.md` for comprehensive documentation and usage examples.
