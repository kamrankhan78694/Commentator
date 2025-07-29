# 🏗️ Commentator Database Design Diagram

This document provides visual representations of the Commentator database architecture and entity relationships.

## 📊 Entity Relationship Diagram

```
                    ┌─────────────────┐
                    │      USERS      │
                    │═════════════════│
                    │ id (PK)         │
                    │ firebase_uid    │
                    │ wallet_address  │
                    │ email           │
                    │ display_name    │
                    │ user_type       │
                    │ reputation_score│
                    │ is_verified     │
                    │ created_at      │
                    └─────────┬───────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │    SESSIONS     │ │   COMMENTS   │ │ USER_ROLES   │
    │═════════════════│ │══════════════│ │══════════════│
    │ id (PK)         │ │ id (PK)      │ │ user_id (FK) │
    │ user_id (FK)    │ │ author_id(FK)│ │ role_id (FK) │
    │ session_id      │ │ text         │ │ assigned_at  │
    │ ip_address      │ │ url          │ └──────────────┘
    │ created_at      │ │ url_hash     │
    │ expires_at      │ │ domain       │
    └─────────────────┘ │ vote_score   │
                        │ is_nft       │
                        │ ipfs_hash    │
                        │ status       │
                        │ created_at   │
                        └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
        ┌──────────────┐ ┌────────────┐ ┌──────────────┐
        │COMMENT_VOTES │ │COMMENT_FLAGS│ │COMMENT_TAGS │
        │══════════════│ │════════════│ │══════════════│
        │ comment_id(FK)│ │comment_id  │ │comment_id(FK)│
        │ user_id (FK) │ │reporter_id │ │ tag_id (FK)  │
        │ vote_type    │ │ flag_type  │ └──────────────┘
        │ created_at   │ │ reason     │
        └──────────────┘ │ status     │
                         └────────────┘

    ┌─────────────────┐                    ┌─────────────────┐
    │   BLOCKCHAIN    │                    │  IPFS_CONTENT   │
    │  TRANSACTIONS   │                    │═════════════════│
    │═════════════════│                    │ id (PK)         │
    │ id (PK)         │                    │ ipfs_hash       │
    │ tx_hash         │◄───────────────────┤ content_type    │
    │ block_number    │                    │ entity_type     │
    │ from_address    │                    │ entity_id       │
    │ to_address      │                    │ pin_status      │
    │ gas_used        │                    │ uploaded_at     │
    │ status          │                    └─────────────────┘
    │ entity_type     │
    │ entity_id       │
    └─────────────────┘

    ┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
    │   AUDIT_LOGS    │     │ ERROR_LOGS   │     │ PERFORMANCE     │
    │═════════════════│     │══════════════│     │   _METRICS      │
    │ id (PK)         │     │ id (PK)      │     │═════════════════│
    │ event_type      │     │ error_type   │     │ id (PK)         │
    │ entity_type     │     │ error_msg    │     │ metric_name     │
    │ entity_id       │     │ stack_trace  │     │ metric_value    │
    │ user_id (FK)    │     │ endpoint     │     │ recorded_at     │
    │ old_values      │     │ environment  │     └─────────────────┘
    │ new_values      │     │ occurred_at  │
    │ created_at      │     └──────────────┘
    └─────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Browser Ext    │   Web App      │      Mobile Apps            │
│                 │                │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   REST APIs     │   GraphQL      │    WebSocket               │
│   (CRUD)        │   (Queries)    │    (Real-time)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Comment Svc    │  User Mgmt     │   Moderation Engine        │
│  Vote Engine    │  Auth Service  │   NFT Processor            │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │     Redis      │      Elasticsearch         │
│   (Primary)     │   (Cache)      │      (Search)              │
│                 │                │                             │
│ • Users         │ • Sessions     │ • Comment Search           │
│ • Comments      │ • Rate Limits  │ • User Search              │
│ • Votes         │ • Cache Data   │ • Analytics                │
│ • Audit Logs    │ • Real-time    │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SYSTEMS                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│      IPFS       │   Blockchain   │    External APIs           │
│   (Storage)     │   (Ethereum)   │   (ENS, Social, etc.)      │
│                 │                │                             │
│ • Comments      │ • NFT Minting  │ • User Profiles            │
│ • Media Files   │ • Transactions │ • Domain Info              │
│ • Metadata      │ • Events       │ • Verification             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 🗃️ Table Relationships Matrix

| Entity | Users | Comments | Sessions | Votes | Flags | Tags | Files |
|--------|-------|----------|----------|-------|-------|------|-------|
| **Users** | - | 1:M | 1:M | 1:M | 1:M | - | 1:M |
| **Comments** | M:1 | 1:M (replies) | - | 1:M | 1:M | M:M | M:M |
| **Sessions** | M:1 | - | - | - | - | - | - |
| **Votes** | M:1 | M:1 | - | - | - | - | - |
| **Flags** | M:1 | M:1 | - | - | - | - | - |
| **Tags** | - | M:M | - | - | - | - | - |
| **Files** | M:1 | M:M | - | - | - | - | 1:M |

## 📈 Scalability Patterns

### Horizontal Scaling Strategy

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └─────────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
    │   App Server    │ │ App Server  │ │ App Server  │
    │      #1         │ │     #2      │ │     #3      │
    └─────────┬───────┘ └─────────────┘ └─────────────┘
              │
              ▼
    ┌─────────────────┐
    │   Primary DB    │ ◄─── Write Operations
    │  (PostgreSQL)   │
    └─────────┬───────┘
              │
    ┌─────────┼────────────────┐
    │         │                │
    ▼         ▼                ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│Read     │ │Read     │ │ Redis    │
│Replica  │ │Replica  │ │ Cache    │
│   #1    │ │   #2    │ │ Cluster  │
└─────────┘ └─────────┘ └──────────┘
```

### Data Partitioning Strategy

```
Comments Table Partitioning by Domain:

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Partition    │ │    Partition    │ │    Partition    │
│   news.com      │ │   social.com    │ │   ecommerce.*   │
│   cnn.com       │ │   reddit.com    │ │   amazon.*      │
│   bbc.com       │ │   twitter.com   │ │   shop.*        │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Audit Logs Partitioning by Time:

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    2024-01      │ │    2024-02      │ │    2024-03      │
│   January       │ │   February      │ │    March        │
│   Partition     │ │   Partition     │ │   Partition     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🔐 Security Architecture

### Row-Level Security (RLS) Example

```sql
-- Users can only see their own data
CREATE POLICY user_own_data ON users
    FOR ALL 
    TO authenticated_user 
    USING (id = current_user_id());

-- Comments are publicly readable but privately writable
CREATE POLICY comment_read_all ON comments
    FOR SELECT 
    TO public 
    USING (status = 'active');

CREATE POLICY comment_write_own ON comments
    FOR INSERT 
    TO authenticated_user 
    WITH CHECK (author_id = current_user_id());
```

### Encryption Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    ENCRYPTION LAYERS                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Application    │    Database     │       Network          │
│   Level         │     Level       │        Level           │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • User emails   │ • Transparent   │ • TLS 1.3 for all     │
│ • Private data  │   column        │   connections          │
│ • API keys      │   encryption    │ • Certificate pinning  │
│ • Wallet keys   │ • Encrypted     │ • Perfect Forward      │
│                 │   backups       │   Secrecy              │
└─────────────────┴─────────────────┴─────────────────────────┘
```

This comprehensive database design supports all current and planned features of Commentator while ensuring scalability, security, and maintainability for a global decentralized commenting platform.