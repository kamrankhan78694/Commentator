/**
 * Web3 Module
 *
 * Handles Web3 wallet connection, MetaMask integration, and blockchain
 * functionality for the Commentator application.
 *
 * @module Web3
 */

// Contract configuration (update these for your deployment)
const CONTRACT_CONFIG = {
  address: '0x1234567890123456789012345678901234567890', // Replace with deployed contract address
  abi: [
    // Essential ABI for CommentNFT contract
    'function mintComment(address to, string memory threadId, string memory ipfsHash) public returns (uint256)',
    'function getThreadComments(string memory threadId) public view returns (uint256[] memory)',
    'function getComment(uint256 tokenId) public view returns (tuple(address author, string threadId, string ipfsHash, uint256 timestamp))',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function totalComments() public view returns (uint256)',
  ],
  networks: {
    mumbai: {
      chainId: '0x13881', // 80001 in hex
      name: 'Polygon Mumbai',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      blockExplorer: 'https://mumbai.polygonscan.com/',
    },
    localhost: {
      chainId: '0x7a69', // 31337 in hex
      name: 'Local Hardhat',
      rpcUrl: 'http://127.0.0.1:8545',
      blockExplorer: '',
    },
  },
};

// Web3 state
let web3State = {
  provider: null,
  signer: null,
  contract: null,
  userAddress: null,
  networkId: null,
  connected: false,
};

/**
 * Initialize Web3 functionality
 */
export function initWeb3() {
  const connectBtn = document.getElementById('connect-wallet-btn');
  const disconnectBtn = document.getElementById('disconnect-wallet-btn');
  // submitBtn referenced but not used in this scope
  document.getElementById('submit-comment-btn');

  if (connectBtn) {
    connectBtn.addEventListener('click', connectWallet);
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectWallet);
  }

  // Check if already connected
  if (window.ethereum) {
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
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
export async function connectWallet() {
  try {
    if (!window.ethereum) {
      if (window.showNotification) {
        window.showNotification(
          'MetaMask not detected. Please install MetaMask.',
          'error'
        );
      }
      return;
    }

    if (window.showNotification) {
      window.showNotification('Connecting to MetaMask...', 'info');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Initialize ethers provider
    if (window.ethers) {
      web3State.provider = new window.ethers.BrowserProvider(window.ethereum);
      web3State.signer = await web3State.provider.getSigner();
      web3State.userAddress = accounts[0];

      // Get network info
      const network = await web3State.provider.getNetwork();
      web3State.networkId = network.chainId.toString();

      // Initialize contract (use mock contract for demo)
      try {
        web3State.contract = new window.ethers.Contract(
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

      if (window.showNotification) {
        window.showNotification('Wallet connected successfully!', 'success');
      }
    } else {
      throw new Error('Ethers.js library not loaded');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    if (window.showNotification) {
      window.showNotification(
        `Failed to connect wallet: ${error.message}`,
        'error'
      );
    }
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
  web3State = {
    provider: null,
    signer: null,
    contract: null,
    userAddress: null,
    networkId: null,
    connected: false,
  };

  updateWalletUI();
  if (window.showNotification) {
    window.showNotification('Wallet disconnected', 'info');
  }
}

/**
 * Handle account changes
 * @param {Array} accounts - Array of account addresses
 */
export function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0] !== web3State.userAddress) {
    connectWallet();
  }
}

/**
 * Handle chain/network changes
 */
export function handleChainChanged() {
  // Reload the page when network changes
  window.location.reload();
}

/**
 * Update wallet UI
 */
export function updateWalletUI() {
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
 * @param {string} chainId - The chain ID
 * @returns {string} - Human readable network name
 */
export function getNetworkName(chainId) {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    31337: 'Local Hardhat',
  };
  return networks[chainId] || `Network ${chainId}`;
}

/**
 * Get current Web3 state
 * @returns {Object} - Current Web3 state
 */
export function getWeb3State() {
  return { ...web3State };
}

/**
 * Check if wallet is connected
 * @returns {boolean} - True if wallet is connected
 */
export function isWalletConnected() {
  return web3State.connected;
}

/**
 * Get user address
 * @returns {string|null} - User wallet address or null
 */
export function getUserAddress() {
  return web3State.userAddress;
}

/**
 * Get contract configuration
 * @returns {Object} - Contract configuration
 */
export function getContractConfig() {
  return CONTRACT_CONFIG;
}

/**
 * Initialize Web3 styles
 */
export function initWeb3Styles() {
  const web3Styles = `
    .wallet-status {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    
    .wallet-info {
      background: #f0fff4;
      border: 1px solid #38a169;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    
    .connect-wallet-btn {
      background: #3182ce;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s ease;
    }
    
    .connect-wallet-btn:hover {
      background: #2c5aa0;
    }
    
    .disconnect-wallet-btn {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-left: 8px;
    }
    
    .disconnect-wallet-btn:hover {
      background: #c53030;
    }
    
    .wallet-address {
      font-family: monospace;
      background: #edf2f7;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .network-name {
      color: #38a169;
      font-weight: 600;
      font-size: 14px;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = web3Styles;
  document.head.appendChild(styleSheet);
}
