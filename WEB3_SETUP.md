# NFT Comment System Setup Guide

This guide explains how to set up and use the NFT-based comment system in Commentator.

## Overview

Comments are now stored as NFTs on the blockchain with content hosted on IPFS:
1. **Comment Text** → Uploaded to IPFS via Web3.Storage
2. **IPFS Hash** → Stored as tokenURI in NFT contract
3. **NFT Ownership** → Proves comment authorship

## Prerequisites

### For Users
- MetaMask browser extension installed
- Access to Polygon Mumbai testnet (or local Hardhat network)
- Small amount of test MATIC for gas fees

### For Developers
- Web3.Storage API key (free at https://web3.storage)
- Smart contract deployed on target network

## Quick Setup

### 1. Configure Web3.Storage (Optional)
```javascript
// In js/ipfs.js, replace:
const WEB3_STORAGE_TOKEN = 'YOUR_API_KEY';
// With your actual API key:
const WEB3_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Note:** The system works with mock IPFS URLs for demo purposes if no API key is configured.

### 2. Deploy Smart Contract
```bash
# Using Hardhat (example)
npx hardhat deploy --network mumbai
# Or deploy manually to your preferred network
```

### 3. Update Contract Configuration
```javascript
// In js/main.js, update:
const CONTRACT_CONFIG = {
    address: '0xYourDeployedContractAddress',
    // ... rest of config
};
```

## Usage

### For End Users

1. **Connect Wallet**
   - Click "Connect MetaMask" button
   - Approve connection in MetaMask popup
   - Ensure you're on the correct network (Polygon Mumbai)

2. **Post NFT Comment**
   - Enter a website URL and click "Load Comments"
   - Write your comment in the text area
   - Click "Submit Comment as NFT"
   - Approve the transaction in MetaMask

3. **View NFT Comments**
   - NFT comments display with special badges
   - Wallet addresses are shown (truncated)
   - Links to view content on IPFS are provided

### For Developers

The system provides several integration points:

```javascript
// Upload to IPFS
const ipfsUrl = await IPFSIntegration.uploadCommentToIPFS(commentText, metadata);

// Mint NFT
const tokenId = await contract.mintComment(userAddress, threadId, ipfsHash);

// Retrieve comments for a URL
const tokenIds = await contract.getThreadComments(threadId);
```

## Network Configuration

### Polygon Mumbai Testnet
- Chain ID: 80001 (0x13881)
- RPC URL: https://rpc-mumbai.maticvigil.com/
- Block Explorer: https://mumbai.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

### Local Hardhat Network
- Chain ID: 31337 (0x7a69)
- RPC URL: http://127.0.0.1:8545
- No block explorer needed for local development

## Contract Functions

### Core Functions
- `mintComment(address to, string threadId, string ipfsHash)` - Mint new comment NFT
- `getThreadComments(string threadId)` - Get all comments for a URL/thread
- `getComment(uint256 tokenId)` - Get comment metadata by token ID
- `tokenURI(uint256 tokenId)` - Get IPFS URL for comment content

### Example Thread ID
Thread IDs are generated from URLs:
- `https://example.com/page` → `example.com/page`
- `https://github.com/user/repo` → `github.com/user/repo`

## Troubleshooting

### Common Issues

1. **"MetaMask not detected"**
   - Install MetaMask browser extension
   - Refresh the page

2. **"Contract not deployed"**
   - Deploy the CommentNFT contract to your target network
   - Update the contract address in `CONTRACT_CONFIG`

3. **"Failed to upload to IPFS"**
   - Get a Web3.Storage API key
   - Replace `YOUR_API_KEY` in `js/ipfs.js`
   - Or use the mock implementation for testing

4. **"Insufficient funds for gas"**
   - Get test MATIC from the Polygon faucet
   - Ensure you're on the correct network

### Development Mode

For development without Web3.Storage or deployed contracts:
- The system falls back to mock implementations
- Comments still work but aren't actually stored on IPFS/blockchain
- Useful for UI development and testing

## Security Considerations

- Never commit private keys or seed phrases
- Use testnet MATIC, never real funds for testing
- Validate all user inputs before blockchain interactions
- Consider implementing comment moderation mechanisms

## Contributing

To extend the NFT comment system:
1. Smart contract changes go in `contracts/CommentNFT.sol`
2. IPFS integration updates go in `js/ipfs.js`
3. Web3 functionality updates go in `js/main.js`
4. UI changes require updates to `index.html` and `css/main.css`