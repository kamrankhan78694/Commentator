// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CommentNFT
 * @dev NFT contract for storing comments on IPFS
 * Each comment is minted as an NFT with IPFS hash as tokenURI
 */
contract CommentNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to comment metadata
    mapping(uint256 => CommentData) public comments;
    
    // Mapping from hashed thread ID (bytes32) to list of comment token IDs
    mapping(bytes32 => uint256[]) public threadComments;
    
    struct CommentData {
        address author;
        string threadId;
        string ipfsHash;
        uint256 timestamp;
    }
    
    event CommentMinted(
        uint256 indexed tokenId,
        address indexed author,
        string threadId,
        string ipfsHash,
        uint256 timestamp
    );
    
    constructor() ERC721("CommentNFT", "COMMENT") {}
    
    /**
     * @dev Mint a new comment NFT
     * @param to Address to mint the NFT to
     * @param threadId Thread identifier (e.g., "example.com/thread-123")
     * @param ipfsHash IPFS hash of the comment content
     */
    function mintComment(
        address to,
        string memory threadId,
        string memory ipfsHash
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        // Store comment data
        comments[tokenId] = CommentData({
            author: to,
            threadId: threadId,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });
        
        // Add to thread
        threadComments[threadId].push(tokenId);
        
        emit CommentMinted(tokenId, to, threadId, ipfsHash, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Get comments for a specific thread
     * @param threadId Thread identifier
     * @return Array of token IDs for the thread
     */
    function getThreadComments(string memory threadId) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return threadComments[threadId];
    }
    
    /**
     * @dev Get comment data by token ID
     * @param tokenId Token ID of the comment
     * @return CommentData struct with comment information
     */
    function getComment(uint256 tokenId) 
        public 
        view 
        returns (CommentData memory) 
    {
        require(_exists(tokenId), "Comment does not exist");
        return comments[tokenId];
    }
    
    /**
     * @dev Get total number of comments minted
     */
    function totalComments() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
}