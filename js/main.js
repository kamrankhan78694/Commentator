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
 * Get the base URL for the site (handles GitHub Pages deployment)
 */
function getBaseUrl() {
    // Check if we're on GitHub Pages
    if (window.location.hostname === 'kamrankhan78694.github.io') {
        return '/Commentator/';
    }
    // Local development or other deployments
    return '/';
}

/**
 * Load header and footer components dynamically
 */
async function loadHeaderAndFooter() {
    try {
        const baseUrl = getBaseUrl();
        
        // Load header
        const headerResponse = await fetch(`${baseUrl}includes/header.html`);
        if (headerResponse.ok) {
            if (window.CommentatorLogger) {
                window.CommentatorLogger.success('Header loaded successfully', 'COMPONENTS');
            }
            const headerHTML = await headerResponse.text();
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHTML;
                
                // Fix the logo link to use proper base URL
                const logoLink = document.getElementById('logo-link');
                if (logoLink) {
                    logoLink.href = `${baseUrl}index.html`;
                }
                
                // Fix the logo image path to use proper base URL
                const logoImg = headerPlaceholder.querySelector('.logo-image');
                if (logoImg) {
                    logoImg.src = `${baseUrl}assets/logo-light.svg`;
                }
                
                configureNavigation();
                // Re-initialize navigation-dependent functions after header is loaded
                initSmoothScrolling();
                initNavigationHighlight();
                initMobileMenu();
            }
        } else {
            console.warn('Failed to load header:', headerResponse.status);
            if (window.CommentatorLogger) {
                window.CommentatorLogger.error(`Failed to load header: ${headerResponse.status}`, 'COMPONENTS');
            }
        }
        
        // Load footer
        const footerResponse = await fetch(`${baseUrl}includes/footer.html`);
        if (footerResponse.ok) {
            if (window.CommentatorLogger) {
                window.CommentatorLogger.success('Footer loaded successfully', 'COMPONENTS');
            }
            const footerHTML = await footerResponse.text();
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHTML;
                
                // Fix footer links to use proper base URL
                fixFooterLinks(baseUrl);
                // Initialize footer functionality
                initNewsletterForm();
                // Initialize feather icons in footer
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            }
        } else {
            console.warn('Failed to load footer:', footerResponse.status);
            if (window.CommentatorLogger) {
                window.CommentatorLogger.error(`Failed to load footer: ${footerResponse.status}`, 'COMPONENTS');
            }
        }
    } catch (error) {
        console.error('Error loading header/footer components:', error);
        if (window.CommentatorLogger) {
            window.CommentatorLogger.error('Error loading header/footer components', 'COMPONENTS', error);
        }
    }
}

/**
 * Fix footer links to use proper base URL
 */
function fixFooterLinks(baseUrl) {
    const footer = document.getElementById('footer-placeholder');
    if (!footer) return;
    
    // Fix internal navigation links
    const internalLinks = footer.querySelectorAll('a[href^="index.html"], a[href^="docs/"]');
    internalLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('index.html') || href.startsWith('docs/')) {
            link.href = baseUrl + href;
        }
    });
}

/**
 * Configure navigation based on current page
 */
function configureNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    const currentPage = window.location.pathname;
    const baseUrl = BASE_URL;
    let navItems = [];
    
    if (currentPage.includes('/docs/')) {
        // Documentation page navigation
        navItems = [
            { href: `${baseUrl}docs/`, text: 'Documentation Home' },
            { href: `${baseUrl}docs/getting-started.html`, text: 'Getting Started' },
            { href: `${baseUrl}docs/usage.html`, text: 'Usage' },
            { href: `${baseUrl}docs/api.html`, text: 'API' },
            { href: `${baseUrl}docs/contributing.html`, text: 'Contributing' },
            { href: `${baseUrl}docs/faq.html`, text: 'FAQ' },
            { href: `${baseUrl}index.html`, text: 'Home' }
        ];
    } else {
        // Homepage navigation
        navItems = [
            { href: '#features', text: 'Features' },
            { href: '#how-it-works', text: 'How It Works' },
            { href: '#about', text: 'About' },
            { href: `${baseUrl}docs/`, text: 'Documentation' },
            { href: 'https://github.com/kamrankhan78694/Commentator', text: 'GitHub', target: '_blank' }
        ];
    }
    
    // Build navigation HTML
    nav.innerHTML = navItems.map(item => 
        `<a href="${item.href}"${item.target ? ` target="${item.target}"` : ''}>${item.text}</a>`
    ).join('');
}

/**
 * Scroll to demo section smoothly
 */
function scrollToDemo() {
    const demoSection = document.querySelector('.demo');
    if (demoSection) {
        demoSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('🗨️ Commentator interface initialized');
    
    // Log application initialization
    if (window.CommentatorLogger) {
        window.CommentatorLogger.info('Application initializing...', 'INIT');
        window.CommentatorLogger.action('Loading header and footer components', 'info', 'INIT');
    }
    
    // Initialize all functionality
    loadHeaderAndFooter();
    initCommentInterface();
    
    // Log successful initialization
    setTimeout(() => {
        if (window.CommentatorLogger) {
            window.CommentatorLogger.success('Application initialized successfully', 'INIT');
            window.CommentatorLogger.info('Debug panel available - Press Ctrl+~ to toggle', 'HELP');
        }
    }, 1000);
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navContainer = document.getElementById('nav-container');
    
    if (!mobileMenuToggle || !navContainer) return;
    
    mobileMenuToggle.addEventListener('click', function() {
        const isActive = mobileMenuToggle.classList.contains('active');
        
        if (isActive) {
            mobileMenuToggle.classList.remove('active');
            navContainer.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        } else {
            mobileMenuToggle.classList.add('active');
            navContainer.classList.add('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideMenu = mobileMenuToggle.contains(e.target) || navContainer.contains(e.target);
        
        if (!isClickInsideMenu && navContainer.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navContainer.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close mobile menu when window is resized to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            navContainer.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Initialize newsletter form functionality
 */
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
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
        showNotification('Thank you for subscribing! We\'ll keep you updated on important project news.', 'success');
        emailInput.value = '';
    });
}

/**
 * Validate email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

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
                // Close mobile menu if open
                const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
                const navContainer = document.getElementById('nav-container');
                if (mobileMenuToggle && navContainer) {
                    mobileMenuToggle.classList.remove('active');
                    navContainer.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
                
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
                showNotification('Please enter a valid URL', 'error');
                urlInput.focus();
                return;
            }
            
            if (!isValidUrl(url)) {
                showNotification('Please enter a valid URL (e.g., https://example.com)', 'error');
                urlInput.focus();
                return;
            }
            
            // Show loading state on button
            const originalText = loadCommentsBtn.textContent;
            loadCommentsBtn.textContent = 'Loading...';
            loadCommentsBtn.disabled = true;
            
            // Load comments with proper API integration
            loadCommentsForUrl(url, commentsSection).finally(() => {
                // Reset button state
                loadCommentsBtn.textContent = originalText;
                loadCommentsBtn.disabled = false;
            });
        });
    }
    
    // Handle "Submit Comment" button click
    if (submitCommentBtn && commentText) {
        submitCommentBtn.addEventListener('click', function() {
            const comment = commentText.value.trim();
            const url = urlInput ? urlInput.value.trim() : '';
            
            if (!url) {
                showNotification('Please load a URL first', 'error');
                return;
            }
            
            if (!comment) {
                showNotification('Please enter a comment', 'error');
                commentText.focus();
                return;
            }
            
            // Submit comment with real API integration
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
 * Load comments for a URL using Firebase
 * @param {string} url - The URL to load comments for
 * @param {HTMLElement} commentsSection - The element to display comments in
 */
async function loadCommentsForUrl(url, commentsSection) {
    if (window.CommentatorLogger) {
        window.CommentatorLogger.action(`Loading comments for ${url}`, 'info', 'COMMENTS');
    }
    
    // Show loading state
    commentsSection.innerHTML = `
        <div class="loading">
            <p>🔄 Loading comments for ${url}...</p>
        </div>
    `;
    
    try {
        // Check if Firebase service is available
        if (typeof window.FirebaseService === 'undefined') {
            throw new Error('Firebase service is not available. Please check your connection and try again.');
        }
        
        // Load comments from Firebase
        const comments = await window.FirebaseService.loadComments(url);
        
        if (window.CommentatorLogger) {
            window.CommentatorLogger.success(`Loaded ${comments.length} comments for ${url}`, 'COMMENTS');
        }
        
        // Format timestamps for display
        const formattedComments = comments.map(comment => ({
            ...comment,
            author: comment.author || 'Anonymous',
            timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
            votes: comment.votes || 0
        }));
        
        displayComments(formattedComments, commentsSection);
        
        // Show success message
        if (formattedComments.length > 0) {
            showNotification(`Successfully loaded ${formattedComments.length} comment${formattedComments.length > 1 ? 's' : ''}`, 'success');
        } else {
            showNotification('No comments found for this URL. Be the first to comment!', 'info');
        }
        
        // Set up real-time listener for new comments
        // Unsubscribe any existing listener to avoid multiple active subscriptions
        if (window.currentCommentsUnsubscribe) {
            window.currentCommentsUnsubscribe();
        }
        window.currentCommentsUnsubscribe = window.FirebaseService.subscribeToComments(url, (updatedComments) => {
            const formattedUpdated = updatedComments.map(comment => ({
                ...comment,
                author: comment.author || 'Anonymous',
                timestamp: formatTimestamp(comment.createdAt || comment.timestamp),
                votes: comment.votes || 0
            }));
            displayComments(formattedUpdated, commentsSection);
        });
        
    } catch (error) {
        console.error('Error loading comments:', error);
        if (window.CommentatorLogger) {
            window.CommentatorLogger.error(`Failed to load comments for ${url}: ${error.message}`, 'COMMENTS', error);
        }
        commentsSection.innerHTML = `
            <div class="error-state">
                <p>❌ Failed to load comments: ${error.message}</p>
                <button id="retry-button" class="btn btn-secondary">
                    Retry
                </button>
            </div>
        `;
        
        // Show error notification
        showNotification(`Failed to load comments: ${error.message}`, 'error');
        
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                if (window.CommentatorLogger) {
                    window.CommentatorLogger.action('Retrying comment load', 'info', 'COMMENTS');
                }
                loadCommentsForUrl(url, commentsSection);
            });
        }
    }
}

/**
 * Display comments in the comments section
 * @param {Array} comments - Array of comment objects
 * @param {HTMLElement} commentsSection - The element to display comments in
 * @param {boolean} isNFT - Whether to render as NFT comments
 */
function displayComments(comments, commentsSection, isNFT = false) {
    if (comments.length === 0) {
        commentsSection.innerHTML = `
            <div class="no-comments">
                <p>No comments yet for this URL. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    
    const commentsHtml = comments.map(comment => {
        if (comment.isNFT || isNFT) {
            const shortAddress = comment.author.length > 10 
                ? `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`
                : comment.author;
            
            return `
                <div class="comment nft-comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${shortAddress}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                        <span class="nft-badge">🖼️ NFT #${comment.nftId || comment.id}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="nft-info">
                        <small>
                            <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
                            | Wallet: <span title="${comment.author}">${shortAddress}</span>
                        </small>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">👤 ${comment.author}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="comment-votes">👍 ${comment.votes}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
        }
    }).join('');
    
    commentsSection.innerHTML = `
        <div class="comments-list">
            <h4>💬 Comments (${comments.length})</h4>
            ${commentsHtml}
        </div>
    `;
}

/**
 * Submit a new comment using Firebase API
 * @param {string} url - The URL the comment is for
 * @param {string} comment - The comment text
 * @param {HTMLElement} commentsSection - The comments display element
 * @param {HTMLElement} commentTextarea - The comment input element
 */
async function submitComment(url, comment, commentsSection, commentTextarea) {
    // Show submitting state
    const submitBtn = document.getElementById('submit-comment-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Check if Firebase service is available
        if (typeof window.FirebaseService === 'undefined') {
            throw new Error('Firebase service is not available. Please check your connection and try again.');
        }
        
        // Use real Firebase API
        await window.FirebaseService.initAuth(); // Ensure user is authenticated
        
        const commentData = {
            author: 'Anonymous', // In a real app, this would be the logged-in user
            text: comment,
            votes: 0,
            timestamp: new Date().toISOString()
        };
        
        // Save comment to Firebase
        const commentId = await window.FirebaseService.saveComment(url, commentData);
        console.log('Comment saved with ID:', commentId);
        
        // Clear the textarea
        commentTextarea.value = '';
        
        // Show success message
        showNotification('Comment submitted successfully! 🎉', 'success');
        
        // The real-time listener will automatically update the UI
        // so we don't need to manually add the comment to the display
        
    } catch (error) {
        console.error('Error submitting comment:', error);
        
        // Show error notification
        showNotification(`Failed to submit comment: ${error.message}`, 'error');
        
    } finally {
        // Reset submit button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Scroll to comments section
        setTimeout(() => {
            const newCommentElement = commentsSection.querySelector('.new-comment');
            if (newCommentElement) {
                newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    newCommentElement.classList.remove('new-comment');
                }, 3000);
            }
        }, 100);
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'success') {
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

/**
 * ========================================
 * WEB3 & NFT Integration
 * ========================================
 */

// Contract configuration (update these for your deployment)
const CONTRACT_CONFIG = {
    address: '0x1234567890123456789012345678901234567890', // Replace with deployed contract address
    abi: [
        // Essential ABI for CommentNFT contract
        "function mintComment(address to, string memory threadId, string memory ipfsHash) public returns (uint256)",
        "function getThreadComments(string memory threadId) public view returns (uint256[] memory)",
        "function getComment(uint256 tokenId) public view returns (tuple(address author, string threadId, string ipfsHash, uint256 timestamp))",
        "function tokenURI(uint256 tokenId) public view returns (string memory)",
        "function totalComments() public view returns (uint256)"
    ],
    networks: {
        mumbai: {
            chainId: '0x13881', // 80001 in hex
            name: 'Polygon Mumbai',
            rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
            blockExplorer: 'https://mumbai.polygonscan.com/'
        },
        localhost: {
            chainId: '0x7a69', // 31337 in hex  
            name: 'Local Hardhat',
            rpcUrl: 'http://127.0.0.1:8545',
            blockExplorer: ''
        }
    }
};

// Web3 state
let web3State = {
    provider: null,
    signer: null,
    contract: null,
    userAddress: null,
    networkId: null,
    connected: false
};

/**
 * Initialize Web3 functionality
 */
function initWeb3() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-wallet-btn');
    const submitBtn = document.getElementById('submit-comment-btn');
    
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
    
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }
    
    // Check if already connected
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    connectWallet();
                }
            })
            .catch(console.error);
    }
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showNotification('MetaMask not detected. Please install MetaMask.', 'error');
            return;
        }
        
        showNotification('Connecting to MetaMask...', 'info');
        
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
        // Initialize ethers provider
        web3State.provider = new ethers.BrowserProvider(window.ethereum);
        web3State.signer = await web3State.provider.getSigner();
        web3State.userAddress = accounts[0];
        
        // Get network info
        const network = await web3State.provider.getNetwork();
        web3State.networkId = network.chainId.toString();
        
        // Initialize contract (use mock contract for demo)
        try {
            web3State.contract = new ethers.Contract(
                CONTRACT_CONFIG.address,
                CONTRACT_CONFIG.abi,
                web3State.signer
            );
        } catch (error) {
            console.warn('Contract not deployed, using mock contract for demo');
            web3State.contract = null;
        }
        
        web3State.connected = true;
        updateWalletUI();
        
        showNotification('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification(`Failed to connect wallet: ${error.message}`, 'error');
    }
}

/**
 * Disconnect wallet
 */
function disconnectWallet() {
    web3State = {
        provider: null,
        signer: null,
        contract: null,
        userAddress: null,
        networkId: null,
        connected: false
    };
    
    updateWalletUI();
    showNotification('Wallet disconnected', 'info');
}

/**
 * Handle account changes
 */
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else if (accounts[0] !== web3State.userAddress) {
        connectWallet();
    }
}

/**
 * Handle chain/network changes
 */
function handleChainChanged(chainId) {
    // Reload the page when network changes
    window.location.reload();
}

/**
 * Update wallet UI
 */
function updateWalletUI() {
    const walletStatus = document.getElementById('wallet-status');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const networkName = document.getElementById('network-name');
    const submitBtn = document.getElementById('submit-comment-btn');
    
    if (web3State.connected) {
        if (walletStatus) walletStatus.style.display = 'none';
        if (walletInfo) walletInfo.style.display = 'block';
        
        if (walletAddress) {
            const shortAddress = `${web3State.userAddress.slice(0, 6)}...${web3State.userAddress.slice(-4)}`;
            walletAddress.textContent = shortAddress;
            walletAddress.title = web3State.userAddress;
        }
        
        if (networkName) {
            const network = getNetworkName(web3State.networkId);
            networkName.textContent = network;
        }
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Comment as NFT';
        }
    } else {
        if (walletStatus) walletStatus.style.display = 'block';
        if (walletInfo) walletInfo.style.display = 'none';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connect Wallet to Submit';
        }
    }
}

/**
 * Get network name from chain ID
 */
function getNetworkName(chainId) {
    const networks = {
        '1': 'Ethereum Mainnet',
        '5': 'Goerli Testnet',
        '137': 'Polygon Mainnet',
        '80001': 'Polygon Mumbai',
        '31337': 'Local Hardhat'
    };
    return networks[chainId] || `Network ${chainId}`;
}

/**
 * Modified submit comment function with NFT integration
 */
async function submitCommentAsNFT(url, comment, commentsSection, commentTextarea) {
    if (!web3State.connected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submit-comment-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Step 1: Upload to IPFS
        submitBtn.textContent = 'Uploading to IPFS...';
        submitBtn.disabled = true;
        
        const ipfsUrl = await IPFSIntegration.uploadCommentToIPFS(comment, {
            author: web3State.userAddress,
            url: url
        });
        
        console.log('Comment uploaded to IPFS:', ipfsUrl);
        
        // Step 2: Mint NFT
        submitBtn.textContent = 'Minting NFT...';
        
        const threadId = IPFSIntegration.generateThreadId(url);
        const ipfsHash = IPFSIntegration.extractIPFSHash(ipfsUrl);
        
        let tokenId;
        if (web3State.contract) {
            // Real contract interaction
            const tx = await web3State.contract.mintComment(
                web3State.userAddress,
                threadId,
                ipfsHash
            );
            
            submitBtn.textContent = 'Confirming transaction...';
            const receipt = await tx.wait();
            
            // Extract token ID from events
            const event = receipt.logs.find(log => log.topics[0] === ethers.id('CommentMinted(uint256,address,string,string,uint256)'));
            tokenId = ethers.getBigInt(event?.topics[1] || '0').toString();
            
        } else {
            // Mock NFT minting for demo
            await new Promise(resolve => setTimeout(resolve, 2000));
            tokenId = Date.now().toString();
            console.log('Mock NFT minted with token ID:', tokenId);
        }
        
        // Step 3: Display the new NFT comment
        const newComment = {
            id: tokenId,
            author: web3State.userAddress,
            text: comment,
            timestamp: new Date().toLocaleString(),
            votes: 0,
            nftId: tokenId,
            ipfsUrl: ipfsUrl,
            isNFT: true
        };
        
        displayNFTComment(newComment, commentsSection);
        
        // Clear the textarea
        commentTextarea.value = '';
        
        showNotification('Comment minted as NFT successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('Error submitting comment as NFT:', error);
        showNotification(`Failed to submit comment: ${error.message}`, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = !web3State.connected;
    }
}

/**
 * Display NFT comment in the UI
 */
function displayNFTComment(comment, commentsSection) {
    const existingComments = commentsSection.querySelector('.comments-list');
    
    const shortAddress = comment.author.slice(0, 6) + '...' + comment.author.slice(-4);
    const nftCommentHtml = `
        <div class="comment nft-comment new-comment">
            <div class="comment-header">
                <span class="comment-author">👤 ${shortAddress}</span>
                <span class="comment-timestamp">${comment.timestamp}</span>
                <span class="comment-votes">👍 ${comment.votes}</span>
                <span class="nft-badge">🖼️ NFT #${comment.nftId}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="nft-info">
                <small>
                    <a href="${comment.ipfsUrl}" target="_blank" rel="noopener">View on IPFS</a>
                    | Wallet: <span title="${comment.author}">${shortAddress}</span>
                </small>
            </div>
        </div>
    `;
    
    if (existingComments) {
        existingComments.insertAdjacentHTML('beforeend', nftCommentHtml);
    } else {
        displayComments([comment], commentsSection, true);
    }
    
    // Scroll to the new comment
    setTimeout(() => {
        const newCommentElement = commentsSection.querySelector('.new-comment');
        if (newCommentElement) {
            newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                newCommentElement.classList.remove('new-comment');
            }, 3000);
        }
    }, 100);
}





// Initialize Web3 when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initWeb3();
    initFirebaseAuth();
});

/**
 * ========================================
 * FIREBASE INTEGRATION UTILITIES
 * ========================================
 */

// Global variables for Firebase integration
let currentSession = null;
let currentCommentsUnsubscribe = null;

/**
 * Initialize Firebase authentication and session
 */
async function initFirebaseAuth() {
    try {
        // Check if Firebase service is available
        if (typeof window.FirebaseService === 'undefined') {
            console.warn('Firebase service not available, waiting...');
            setTimeout(initFirebaseAuth, 1000);
            return;
        }
        
        // Initialize authentication
        const user = await window.FirebaseService.initAuth();
        
        if (user) {
            // Update user status display
            updateUserStatus('✅ Connected anonymously');
            
            // Enable submit button
            const submitBtn = document.getElementById('submit-comment-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            
            // Create session
            currentSession = await window.FirebaseService.createSession({
                userAgent: navigator.userAgent,
                referrer: document.referrer
            });
            
            // Set up session activity tracking
            setInterval(() => {
                if (currentSession) {
                    window.FirebaseService.updateSessionActivity(currentSession);
                }
            }, 30000); // Update every 30 seconds
            
            console.log('Firebase authentication initialized successfully');
        } else {
            updateUserStatus('❌ Authentication failed');
        }
        
    } catch (error) {
        console.error('Error initializing Firebase auth:', error);
        updateUserStatus('❌ Connection error');
    }
}

/**
 * Update user status display
 * @param {string} status - Status message to display
 */
function updateUserStatus(status) {
    const userStatus = document.getElementById('user-status');
    if (userStatus) {
        userStatus.textContent = status;
    }
}

/**
 * Get user display name
 * @returns {Promise<string>} - User display name
 */
async function getUserDisplayName() {
    try {
        const userData = await window.FirebaseService.loadUserData();
        if (userData && userData.displayName) {
            return userData.displayName;
        }
        
        // Generate a random display name for anonymous users
        const adjectives = ['Happy', 'Smart', 'Kind', 'Friendly', 'Creative', 'Honest', 'Wise', 'Funny'];
        const nouns = ['User', 'Commenter', 'Visitor', 'Reader', 'Member', 'Guest', 'Friend', 'Person'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 1000);
        
        const displayName = `${randomAdjective}${randomNoun}${randomNumber}`;
        
        // Save the generated display name
        await window.FirebaseService.saveUserData({
            displayName,
            createdAt: Date.now()
        });
        
        return displayName;
        
    } catch (error) {
        console.error('Error getting user display name:', error);
        return 'Anonymous';
    }
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted time string
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
        return 'Just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }
    
    // For older dates, show actual date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

/**
 * Clean up Firebase listeners when page unloads
 */
window.addEventListener('beforeunload', function() {
    // Unsubscribe from comment updates
    if (currentCommentsUnsubscribe) {
        currentCommentsUnsubscribe();
    }
    
    // Close session
    if (currentSession) {
        window.FirebaseService.closeSession(currentSession);
    }
});