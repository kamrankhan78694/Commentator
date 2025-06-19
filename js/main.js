/**
 * Commentator - Main JavaScript File
 * 
 * This file provides basic interactivity for the Commentator homepage.
 * It includes:
 * - Header and footer component loading
 * - Smooth scrolling navigation
 * - Comment interface placeholder functionality
 * - Basic form handling
 * - Event listeners for user interactions
 * 
 * Note: This is a foundational file that can be extended as the project grows.
 */

/**
 * Load header and footer components dynamically
 */
async function loadHeaderAndFooter() {
    try {
        // Load header
        const headerResponse = await fetch('includes/header.html');
        if (headerResponse.ok) {
            const headerHTML = await headerResponse.text();
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHTML;
                configureNavigation();
                // Re-initialize navigation-dependent functions after header is loaded
                initSmoothScrolling();
                initNavigationHighlight();
            }
        }
        
        // Load footer
        const footerResponse = await fetch('includes/footer.html');
        if (footerResponse.ok) {
            const footerHTML = await footerResponse.text();
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHTML;
            }
        }
    } catch (error) {
        console.error('Error loading header/footer components:', error);
    }
}

/**
 * Configure navigation based on current page
 */
function configureNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    const currentPage = window.location.pathname;
    let navItems = [];
    
    if (currentPage.includes('documentation.html')) {
        // Documentation page navigation
        navItems = [
            { href: '#introduction', text: 'Introduction' },
            { href: '#getting-started', text: 'Getting Started' },
            { href: '#features', text: 'Features' },
            { href: '#installation', text: 'Installation' },
            { href: '#project-structure', text: 'Structure' },
            { href: '#contributing', text: 'Contributing' },
            { href: '#faq', text: 'FAQ' },
            { href: 'index.html', text: 'Home' }
        ];
    } else {
        // Homepage navigation
        navItems = [
            { href: '#features', text: 'Features' },
            { href: '#how-it-works', text: 'How It Works' },
            { href: '#about', text: 'About' },
            { href: 'documentation.html', text: 'Documentation' },
            { href: 'https://github.com/kamrankhan78694/Commentator', text: 'GitHub', target: '_blank' }
        ];
    }
    
    // Build navigation HTML
    nav.innerHTML = navItems.map(item => 
        `<a href="${item.href}"${item.target ? ` target="${item.target}"` : ''}>${item.text}</a>`
    ).join('');
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('🗨️ Commentator interface initialized');
    
    // Initialize all functionality
    loadHeaderAndFooter();
    initCommentInterface();
});

/**
 * Initialize smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize the comment interface functionality
 */
function initCommentInterface() {
    const urlInput = document.getElementById('website-url');
    const loadCommentsBtn = document.getElementById('load-comments-btn');
    const commentsSection = document.getElementById('comments-section');
    const commentText = document.getElementById('comment-text');
    const submitCommentBtn = document.getElementById('submit-comment-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const demoBtn = document.getElementById('demo-btn');
    
    // Handle "Get Started" button click
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            // Scroll to demo section
            const demoSection = document.getElementById('demo-section');
            if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Handle "View Demo" button click
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            // Scroll to demo section and focus on URL input
            const demoSection = document.getElementById('demo-section');
            if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    if (urlInput) urlInput.focus();
                }, 500);
            }
        });
    }
    
    // Handle "Load Comments" button click
    if (loadCommentsBtn && urlInput && commentsSection) {
        loadCommentsBtn.addEventListener('click', function() {
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('Please enter a valid URL');
                urlInput.focus();
                return;
            }
            
            if (!isValidUrl(url)) {
                alert('Please enter a valid URL (e.g., https://example.com)');
                urlInput.focus();
                return;
            }
            
            // Simulate loading comments (replace with actual API call later)
            loadCommentsForUrl(url, commentsSection);
        });
    }
    
    // Handle "Submit Comment" button click
    if (submitCommentBtn && commentText) {
        submitCommentBtn.addEventListener('click', function() {
            const comment = commentText.value.trim();
            const url = urlInput ? urlInput.value.trim() : '';
            
            if (!url) {
                alert('Please load a URL first');
                return;
            }
            
            if (!comment) {
                alert('Please enter a comment');
                commentText.focus();
                return;
            }
            
            // Simulate submitting comment (replace with actual API call later)
            submitComment(url, comment, commentsSection, commentText);
        });
    }
    
    // Add Enter key support for URL input
    if (urlInput && loadCommentsBtn) {
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadCommentsBtn.click();
            }
        });
    }
}

/**
 * Initialize navigation highlight on scroll
 */
function initNavigationHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Simulate loading comments for a URL
 * @param {string} url - The URL to load comments for
 * @param {HTMLElement} commentsSection - The element to display comments in
 */
function loadCommentsForUrl(url, commentsSection) {
    // Show loading state
    commentsSection.innerHTML = `
        <div class="loading">
            <p>🔄 Loading comments for ${url}...</p>
        </div>
    `;
    
    // Simulate API delay
    setTimeout(() => {
        // Mock comment data (replace with actual API call)
        const mockComments = [
            {
                id: 1,
                author: 'WebUser123',
                text: 'This website has been really helpful for my research. Great content!',
                timestamp: '2 hours ago',
                votes: 5
            },
            {
                id: 2,
                author: 'TechReviewer',
                text: 'Be careful with this site - I noticed some suspicious redirects when clicking certain links.',
                timestamp: '1 day ago',
                votes: 12
            },
            {
                id: 3,
                author: 'HappyCustomer',
                text: 'Excellent service and fast delivery. Highly recommend!',
                timestamp: '3 days ago',
                votes: 8
            }
        ];
        
        displayComments(mockComments, commentsSection);
    }, 1500);
}

/**
 * Display comments in the comments section
 * @param {Array} comments - Array of comment objects
 * @param {HTMLElement} commentsSection - The element to display comments in
 */
function displayComments(comments, commentsSection) {
    if (comments.length === 0) {
        commentsSection.innerHTML = `
            <div class="no-comments">
                <p>No comments yet for this URL. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    
    const commentsHtml = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">👤 ${comment.author}</span>
                <span class="comment-timestamp">${comment.timestamp}</span>
                <span class="comment-votes">👍 ${comment.votes}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join('');
    
    commentsSection.innerHTML = `
        <div class="comments-list">
            <h4>💬 Comments (${comments.length})</h4>
            ${commentsHtml}
        </div>
    `;
}

/**
 * Simulate submitting a new comment
 * @param {string} url - The URL the comment is for
 * @param {string} comment - The comment text
 * @param {HTMLElement} commentsSection - The comments display element
 * @param {HTMLElement} commentTextarea - The comment input element
 */
function submitComment(url, comment, commentsSection, commentTextarea) {
    // Show submitting state
    const submitBtn = document.getElementById('submit-comment-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API delay
    setTimeout(() => {
        // Create new comment object
        const newComment = {
            id: Date.now(),
            author: 'You', // In a real app, this would be the logged-in user
            text: comment,
            timestamp: 'Just now',
            votes: 0
        };
        
        // Add to existing comments or create new list
        const existingComments = commentsSection.querySelector('.comments-list');
        if (existingComments) {
            // Add to existing comments
            const newCommentHtml = `
                <div class="comment new-comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${newComment.author}</span>
                        <span class="comment-timestamp">${newComment.timestamp}</span>
                        <span class="comment-votes">👍 ${newComment.votes}</span>
                    </div>
                    <div class="comment-text">${newComment.text}</div>
                </div>
            `;
            existingComments.insertAdjacentHTML('beforeend', newCommentHtml);
        } else {
            // Create new comments list
            displayComments([newComment], commentsSection);
        }
        
        // Clear the textarea
        commentTextarea.value = '';
        
        // Reset submit button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Comment submitted successfully! 🎉');
        
        // Scroll to the new comment
        const newCommentElement = commentsSection.querySelector('.new-comment');
        if (newCommentElement) {
            newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                newCommentElement.classList.remove('new-comment');
            }, 3000);
        }
    }, 1000);
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
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

// Add some additional styles for the comment interface
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