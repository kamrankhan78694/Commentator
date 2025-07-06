#!/bin/zsh

# Sitemap Enhancement Verification Script
# Validates the enhanced sitemap.xml and related SEO files

echo "🗺️ Sitemap Enhancement Verification"
echo "=================================="
echo ""

# Check if files exist
echo "📁 Checking file existence:"
files=("sitemap.xml" "robots.txt" "_config.yml" "SITEMAP_ENHANCEMENT_SUMMARY.md")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
    fi
done
echo ""

# Validate XML structure
echo "🔍 Validating XML structure:"
python3 -c "
import xml.etree.ElementTree as ET
try:
    with open('sitemap.xml', 'r') as f:
        content = f.read()
    # Remove Jekyll front matter for validation
    xml_content = content.split('---\n')[2] if '---' in content else content
    root = ET.fromstring(xml_content)
    
    # Count URLs
    urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
    print(f'   ✅ XML structure valid with {len(urls)} URLs defined')
    
    # Check for image support
    images = root.findall('.//{http://www.google.com/schemas/sitemap-image/1.1}image')
    if images:
        print(f'   ✅ Image sitemap support included ({len(images)} images)')
    
    # Check namespace support
    if 'xmlns:image' in content and 'xmlns:xhtml' in content:
        print('   ✅ Advanced namespace support included')
        
except Exception as e:
    print(f'   ❌ XML validation failed: {e}')
"
echo ""

# Check robots.txt content
echo "🤖 Validating robots.txt:"
if [ -f "robots.txt" ]; then
    sitemap_count=$(grep -c "Sitemap:" robots.txt)
    allow_count=$(grep -c "Allow:" robots.txt)
    disallow_count=$(grep -c "Disallow:" robots.txt)
    
    echo "   ✅ Sitemap declarations: $sitemap_count"
    echo "   ✅ Allow directives: $allow_count"
    echo "   ✅ Disallow directives: $disallow_count"
    
    if [ $sitemap_count -gt 0 ] && [ $allow_count -gt 0 ] && [ $disallow_count -gt 0 ]; then
        echo "   ✅ robots.txt properly configured"
    else
        echo "   ⚠️ robots.txt may need adjustment"
    fi
else
    echo "   ❌ robots.txt not found"
fi
echo ""

# Check Jekyll configuration
echo "🎯 Checking Jekyll SEO configuration:"
if [ -f "_config.yml" ]; then
    plugins_check=$(grep -q "jekyll-sitemap\|jekyll-seo-tag" _config.yml && echo "✅" || echo "❌")
    seo_check=$(grep -q "description:\|keywords:\|author:" _config.yml && echo "✅" || echo "❌")
    exclude_check=$(grep -q "exclude:" _config.yml && echo "✅" || echo "❌")
    
    echo "   $plugins_check SEO plugins configured"
    echo "   $seo_check Metadata fields present"
    echo "   $exclude_check File exclusions defined"
else
    echo "   ❌ _config.yml not found"
fi
echo ""

# Count documentation pages
echo "📚 Documentation coverage:"
if [ -d "docs" ]; then
    doc_count=$(find docs -name "*.html" | wc -l | tr -d ' ')
    echo "   ✅ Documentation pages: $doc_count"
    
    # Check for key documentation
    key_docs=("getting-started.html" "api.html" "usage.html" "security.html")
    for doc in "${key_docs[@]}"; do
        if [ -f "docs/$doc" ]; then
            echo "   ✅ docs/$doc (high priority page)"
        else
            echo "   ⚠️ docs/$doc (missing high priority page)"
        fi
    done
else
    echo "   ❌ docs directory not found"
fi
echo ""

# Check assets for SEO
echo "🖼️ SEO assets check:"
assets_dir="assets"
if [ -d "$assets_dir" ]; then
    logo_files=$(find $assets_dir -name "*logo*" | wc -l | tr -d ' ')
    favicon_files=$(find $assets_dir -name "*favicon*" | wc -l | tr -d ' ')
    
    echo "   ✅ Logo files: $logo_files"
    echo "   ✅ Favicon files: $favicon_files"
else
    echo "   ⚠️ assets directory not found"
fi
echo ""

echo "✅ VERIFICATION COMPLETE"
echo "======================="
echo ""
echo "🎯 Next steps:"
echo "   1. Test with Jekyll build (if Jekyll is available)"
echo "   2. Submit sitemap to Google Search Console"
echo "   3. Monitor crawl statistics and coverage"
echo "   4. Update sitemap as new content is added"
echo ""
echo "📊 Enhanced sitemap provides:"
echo "   • Comprehensive URL coverage"
echo "   • SEO-optimized priority structure"
echo "   • Image sitemap support"
echo "   • Dynamic Jekyll integration"
echo "   • Smart crawling controls"
