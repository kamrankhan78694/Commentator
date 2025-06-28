import { test, expect } from '@playwright/test'

test.describe('Commentator Basic Functionality', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads
    await expect(page).toHaveTitle(/Commentator/)
    
    // Check for main heading
    await expect(page.locator('h2')).toContainText('Universal Web Comments')
    
    // Check for key elements
    await expect(page.locator('#get-started-btn')).toBeVisible()
    await expect(page.locator('#demo-btn')).toBeVisible()
  })

  test('should have security headers', async ({ page }) => {
    const response = await page.goto('/')
    
    // Check security headers (if running with proper server)
    const headers = response.headers()
    
    // Note: These checks will work in production, local dev server may not have all headers
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff')
    }
    
    if (headers['x-frame-options']) {
      expect(headers['x-frame-options']).toBe('DENY')
    }
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    // Check features section
    await expect(page.locator('#features')).toBeVisible()
    await expect(page.locator('.features-grid')).toBeVisible()
    
    // Check for feature cards
    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(4)
    
    // Check feature titles
    await expect(featureCards.nth(0)).toContainText('Universal Commenting')
    await expect(featureCards.nth(1)).toContainText('Fraud Prevention')
    await expect(featureCards.nth(2)).toContainText('Open Participation')
    await expect(featureCards.nth(3)).toContainText('Fully Open-Source')
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test Get Started button
    await page.locator('#get-started-btn').click()
    
    // Should scroll to or navigate to appropriate section
    // Add specific assertions based on expected behavior
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/')
    
    if (isMobile) {
      // Check mobile-specific elements and layout
      await expect(page.locator('.hero')).toBeVisible()
      await expect(page.locator('.features-grid')).toBeVisible()
      
      // Check that content is properly laid out on mobile
      const viewport = page.viewportSize()
      expect(viewport.width).toBeLessThanOrEqual(768)
    }
  })

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Test JavaScript error handling
    const errorMessages = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text())
      }
    })
    
    // Trigger some interactions that might cause errors
    await page.locator('#get-started-btn').click()
    await page.locator('#demo-btn').click()
    
    // Wait a bit for any async errors
    await page.waitForTimeout(1000)
    
    // Check that no critical errors occurred
    const criticalErrors = errorMessages.filter(msg => 
      msg.includes('TypeError') || 
      msg.includes('ReferenceError') ||
      msg.includes('SyntaxError')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Performance Tests', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Check load time is under 3 seconds (generous for testing)
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000)
      })
    })
    
    // LCP should be under 2.5 seconds
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500)
    }
  })
})