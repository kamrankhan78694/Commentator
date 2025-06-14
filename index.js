// Commentator - Universal Web Comments
// Client-side JavaScript for the commenting interface

class Commentator {
    constructor() {
        this.currentUrl = '';
        this.comments = [];
        this.init();
    }
    
    init() {
        // Bind event listeners
        document.getElementById('urlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loadCommentsForUrl();
        });
        
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
        
        // Load comments for current page if available
        this.loadStoredComments();
    }
    
    loadCommentsForUrl() {
        const urlInput = document.getElementById('websiteUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }
        
        // Normalize URL
        this.currentUrl = this.normalizeUrl(url);
        
        // Update UI
        this.showCommentsSection();
        this.displayCurrentUrl();
        this.loadComments();
    }
    
    normalizeUrl(url) {
        try {
            // Add protocol if missing
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            const urlObj = new URL(url);
            // Return domain + path (no query params or fragments for now)
            return urlObj.origin + urlObj.pathname;
        } catch (error) {
            console.error('Invalid URL:', error);
            return url;
        }
    }
    
    showCommentsSection() {
        document.getElementById('commentsSection').style.display = 'block';
    }
    
    displayCurrentUrl() {
        const statusDiv = document.getElementById('currentUrl');
        statusDiv.textContent = `Viewing comments for: ${this.currentUrl}`;
        statusDiv.style.display = 'block';
    }
    
    loadComments() {
        // For now, load from localStorage
        // In future versions, this would connect to decentralized storage
        const storageKey = `commentator_${this.hashUrl(this.currentUrl)}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
            this.comments = JSON.parse(stored);
        } else {
            this.comments = [];
        }
        
        this.displayComments();
    }
    
    loadStoredComments() {
        // Load all stored comments for debugging/demo purposes
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('commentator_'));
        console.log(`Found ${allKeys.length} sites with comments in local storage`);
    }
    
    submitComment() {
        const commentText = document.getElementById('commentText').value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }
        
        if (!this.currentUrl) {
            alert('Please load a URL first');
            return;
        }
        
        // Create comment object
        const comment = {
            id: Date.now(),
            text: commentText,
            timestamp: new Date().toISOString(),
            url: this.currentUrl,
            // In future: add user identity, signatures, etc.
            author: 'Anonymous User'
        };
        
        // Add to comments array
        this.comments.unshift(comment);
        
        // Save to localStorage (temporary storage)
        this.saveComments();
        
        // Clear form and refresh display
        document.getElementById('commentText').value = '';
        this.displayComments();
        
        // Show success message
        this.showMessage('Comment posted successfully!', 'success');
    }
    
    saveComments() {
        const storageKey = `commentator_${this.hashUrl(this.currentUrl)}`;
        localStorage.setItem(storageKey, JSON.stringify(this.comments));
    }
    
    displayComments() {
        const commentsList = document.getElementById('commentsList');
        
        if (this.comments.length === 0) {
            commentsList.innerHTML = '<div class="status">No comments yet. Be the first to comment!</div>';
            return;
        }
        
        const commentsHtml = this.comments.map(comment => `
            <div class="comment">
                <div class="comment-meta">
                    ${comment.author} • ${this.formatDate(comment.timestamp)}
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `).join('');
        
        commentsList.innerHTML = commentsHtml;
    }
    
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    hashUrl(url) {
        // Simple hash function for URL -> storage key
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            background: ${type === 'success' ? '#28a745' : '#007bff'};
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 3000);
    }
}

// Initialize the Commentator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Commentator();
});

// Export for potential use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Commentator;
}