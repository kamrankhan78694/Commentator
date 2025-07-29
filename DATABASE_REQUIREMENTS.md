# 🗄️ Commentator Database Requirements Analysis

> **Comprehensive database schema requirements for the decentralized commenting system**

## 📋 Executive Summary

This document provides a complete analysis of all database requirements for Commentator, a decentralized web commenting platform. The analysis covers current implementation (Firebase), planned features (IPFS/Web3), and scalability requirements for millions of users.

---

## 1. 🏗️ Core Entities & Data Models

### 1.1 Comments Entity

**Primary entity for storing all comment data**

```sql
CREATE TABLE comments (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    text TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 5000),
    
    -- Authorship
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(100) NOT NULL, -- Display name snapshot
    author_type ENUM('anonymous', 'authenticated', 'web3') NOT NULL DEFAULT 'anonymous',
    
    -- Context
    url TEXT NOT NULL,
    url_hash VARCHAR(255) NOT NULL, -- For efficient querying
    domain VARCHAR(255) NOT NULL,   -- Extracted from URL
    
    -- Hierarchy (for replies)
    parent_comment_id UUID REFERENCES comments(id),
    thread_depth INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    
    -- Engagement
    vote_score INTEGER NOT NULL DEFAULT 0,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    
    -- Web3 & Decentralization
    is_nft BOOLEAN NOT NULL DEFAULT FALSE,
    nft_token_id BIGINT,
    nft_contract_address VARCHAR(42), -- Ethereum address format
    ipfs_hash VARCHAR(255),           -- Content stored on IPFS
    ipfs_url TEXT,
    arweave_tx_id VARCHAR(255),       -- Permanent storage
    
    -- Moderation & Status
    status ENUM('active', 'pending', 'hidden', 'deleted', 'flagged') NOT NULL DEFAULT 'active',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    edit_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    language VARCHAR(5) DEFAULT 'en',
    content_type VARCHAR(50) DEFAULT 'text/plain',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_nft_data CHECK (
        (is_nft = FALSE) OR 
        (is_nft = TRUE AND nft_token_id IS NOT NULL AND nft_contract_address IS NOT NULL)
    ),
    CONSTRAINT valid_parent_depth CHECK (
        (parent_comment_id IS NULL AND thread_depth = 0) OR
        (parent_comment_id IS NOT NULL AND thread_depth > 0)
    )
);

-- Indexes for performance
CREATE INDEX idx_comments_url_hash ON comments(url_hash);
CREATE INDEX idx_comments_domain ON comments(domain);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_nft ON comments(is_nft, nft_contract_address);
```

### 1.2 Users Entity

**User profiles and identity management**

```sql
CREATE TABLE users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    user_type ENUM('anonymous', 'email', 'web3', 'social') NOT NULL DEFAULT 'anonymous',
    firebase_uid VARCHAR(255) UNIQUE, -- Firebase authentication ID
    
    -- Web3 Identity
    wallet_address VARCHAR(42) UNIQUE, -- Ethereum address
    ens_name VARCHAR(255),             -- ENS domain
    wallet_type VARCHAR(50),           -- metamask, walletconnect, etc.
    
    -- Traditional Identity
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Profile
    display_name VARCHAR(100) NOT NULL,
    bio TEXT CHECK (length(bio) <= 500),
    avatar_url TEXT,
    avatar_ipfs_hash VARCHAR(255),
    
    -- Social Links
    twitter_handle VARCHAR(50),
    github_username VARCHAR(100),
    website_url TEXT,
    
    -- Reputation & Gamification
    reputation_score INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    upvotes_received INTEGER NOT NULL DEFAULT 0,
    downvotes_received INTEGER NOT NULL DEFAULT 0,
    
    -- Achievements
    badges JSONB DEFAULT '[]'::jsonb, -- Array of earned badges
    level_tier ENUM('newcomer', 'regular', 'veteran', 'expert', 'legendary') DEFAULT 'newcomer',
    
    -- Preferences
    privacy_level ENUM('public', 'limited', 'private') NOT NULL DEFAULT 'public',
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "web_push": true,
        "comment_replies": true,
        "comment_votes": false,
        "weekly_digest": true
    }'::jsonb,
    
    -- Moderation
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_moderator BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    last_active_at TIMESTAMP WITH TIME ZONE,
    last_ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    signup_source VARCHAR(100), -- organic, referral, campaign
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email_for_email_users CHECK (
        (user_type != 'email') OR (user_type = 'email' AND email IS NOT NULL)
    ),
    CONSTRAINT valid_wallet_for_web3_users CHECK (
        (user_type != 'web3') OR (user_type = 'web3' AND wallet_address IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## 📊 Database Schema Summary

### Core Tables (32 Total)
- **Core Entities** (13): users, comments, sessions, sites, votes, flags, subscriptions, etc.
- **System Management** (8): feature_flags, system_settings, rate_limits, audit_logs, etc.
- **Integration & External** (6): ipfs_content, blockchain_transactions, api_calls, files, etc.
- **Analytics & Performance** (5): user_engagement_metrics, search_queries, cache_entries, etc.

### Key Features Supported
- **Universal Commenting**: Comments on any website with URL-based organization
- **Decentralized Storage**: IPFS and Arweave integration for permanent storage
- **Web3 Integration**: NFT minting, blockchain transactions, wallet authentication
- **Advanced Moderation**: Automated rules, manual actions, community reporting
- **Scalable Architecture**: Caching, indexing, partitioning, and replication strategies
- **Analytics & Monitoring**: User engagement, site performance, system health

### Implementation Strategy
1. **PostgreSQL** as primary database for ACID compliance and JSON support
2. **Redis** for caching and real-time features
3. **Elasticsearch** for advanced search capabilities
4. **Strategic indexing** for performance optimization
5. **Row-level security** for multi-tenant data isolation

This comprehensive schema supports Commentator's evolution from a Firebase-based system to a fully decentralized, scalable commenting platform capable of serving millions of users globally.

