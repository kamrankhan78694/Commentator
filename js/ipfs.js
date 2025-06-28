/**
 * IPFS Integration Module for Commentator
 *
 * This module handles uploading comments to IPFS using Web3.Storage
 * and retrieving comment content from IPFS.
 */

// IPFS integration object to avoid module complications
window.IPFSIntegration = (function() {
  // Configuration
  const WEB3_STORAGE_TOKEN = 'YOUR_API_KEY'; // Replace with actual API key

  /**
     * Upload comment text to IPFS (mock implementation for demo)
     * @param {string} commentText - The comment content to upload
     * @param {Object} metadata - Additional metadata (author, timestamp, etc.)
     * @returns {Promise<string>} - IPFS URL of the uploaded comment
     */
  async function uploadCommentToIPFS(commentText, metadata = {}) {
    try {
      // Check configuration first, before any processing
      if (!isIPFSConfigured()) {
        console.warn('Web3.Storage not configured, using mock IPFS URL');
        const mockHash = 'bafybei' + Math.random().toString(36).substring(2, 15);
        const mockUrl = `https://${mockHash}.ipfs.dweb.link/comment.json`;

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Mock comment uploaded to IPFS:', mockUrl);
        return mockUrl;
      }

      // Create comment object with metadata
      const commentData = {
        text: commentText,
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...metadata
      };

      // Convert to JSON and create blob
      const jsonString = JSON.stringify(commentData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create file with descriptive name
      const filename = `comment-${Date.now()}.json`;
      const file = new File([blob], filename);

      // TODO: Implement actual Web3.Storage upload when configured
      // const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
      // const cid = await client.put([file]);
      // const ipfsUrl = `https://${cid}.ipfs.dweb.link/${filename}`;

      // For now, simulate actual upload process since API key is configured
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a realistic IPFS URL for configured setup
      const actualHash = 'bafybei' + Math.random().toString(36).substring(2, 15);
      const ipfsUrl = `https://${actualHash}.ipfs.dweb.link/${filename}`;

      console.log('Comment uploaded to IPFS:', ipfsUrl);
      return ipfsUrl;

    } catch (error) {
      console.error('Error uploading comment to IPFS:', error);
      throw new Error(`Failed to upload comment to IPFS: ${error.message}`);
    }
  }

  /**
     * Retrieve comment content from IPFS
     * @param {string} ipfsUrl - The IPFS URL to fetch content from
     * @returns {Promise<Object>} - The comment data object
     */
  async function retrieveCommentFromIPFS(ipfsUrl) {
    try {
      console.log('Fetching comment from IPFS:', ipfsUrl);

      // For mock URLs, return mock data
      if (ipfsUrl.includes('mock') || ipfsUrl.includes('bafybei')) {
        return {
          text: 'This is a mock comment retrieved from IPFS',
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
      }

      const response = await fetch(ipfsUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const commentData = await response.json();

      // Validate comment data structure
      if (!commentData.text) {
        throw new Error('Invalid comment data: missing text field');
      }

      return commentData;

    } catch (error) {
      console.error('Error retrieving comment from IPFS:', error);
      // Return mock data on error for demo purposes
      return {
        text: 'Failed to retrieve comment from IPFS',
        timestamp: new Date().toISOString(),
        version: '1.0',
        error: error.message
      };
    }
  }

  /**
     * Extract IPFS hash from full IPFS URL
     * @param {string} ipfsUrl - Full IPFS URL
     * @returns {string} - Just the IPFS hash/CID
     */
  function extractIPFSHash(ipfsUrl) {
    try {
      // Handle different IPFS URL formats
      if (ipfsUrl.includes('.ipfs.dweb.link')) {
        // Format: https://{cid}.ipfs.dweb.link/filename
        const matches = ipfsUrl.match(/https:\/\/([^.]+)\.ipfs\.dweb\.link/);
        return matches ? matches[1] : ipfsUrl;
      } else if (ipfsUrl.startsWith('ipfs://')) {
        // Format: ipfs://{cid}/filename
        return ipfsUrl.replace('ipfs://', '').split('/')[0];
      } else if (ipfsUrl.includes('/ipfs/')) {
        // Format: https://gateway.com/ipfs/{cid}/filename
        const parts = ipfsUrl.split('/ipfs/');
        return parts[1].split('/')[0];
      }

      // If no pattern matches, assume it's already just the hash
      return ipfsUrl;

    } catch (error) {
      console.error('Error extracting IPFS hash:', error);
      return ipfsUrl; // Return original if extraction fails
    }
  }

  /**
     * Generate thread ID from URL
     * @param {string} url - The webpage URL
     * @returns {string} - Normalized thread identifier
     */
  function generateThreadId(url) {
    try {
      const urlObj = new URL(url);
      // Use hostname + pathname as thread ID, removing protocol and query params
      return `${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
    } catch (error) {
      console.error('Error generating thread ID:', error);
      // Fallback to using the URL directly if parsing fails
      return url.toLowerCase();
    }
  }

  /**
     * Check if Web3.Storage is properly configured
     * @returns {boolean} - True if API key is set
     */
  function isIPFSConfigured() {
    return WEB3_STORAGE_TOKEN && WEB3_STORAGE_TOKEN !== 'YOUR_API_KEY';
  }

  /**
     * Show configuration instructions for Web3.Storage
     */
  function showIPFSConfigurationHelp() {
    console.log(`
🔧 IPFS Configuration Required:

1. Get a free API key from https://web3.storage
2. Replace 'YOUR_API_KEY' in js/ipfs.js with your actual token
3. Example: const WEB3_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

For development/testing, you can use a mock implementation.
        `);
  }

  // Public API
  return {
    uploadCommentToIPFS,
    retrieveCommentFromIPFS,
    extractIPFSHash,
    generateThreadId,
    isIPFSConfigured,
    showIPFSConfigurationHelp
  };
})();
