# <img src="assets/logo-light.svg" alt="Commentator" height="40"> Commentator

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/kamrankhan78694/Commentator/releases)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)](https://github.com/kamrankhan78694/Commentator)
[![Web3](https://img.shields.io/badge/Web3-Enabled-purple.svg)](https://web3.foundation/)
[![Decentralized](https://img.shields.io/badge/Decentralized-Network-orange.svg)](https://en.wikipedia.org/wiki/Decentralization)
[![Community](https://img.shields.io/badge/Community-Driven-brightgreen.svg)](https://github.com/kamrankhan78694/Commentator/discussions)
[![Contributors](https://img.shields.io/github/contributors/kamrankhan78694/Commentator.svg)](https://github.com/kamrankhan78694/Commentator/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/kamrankhan78694/Commentator.svg)](https://github.com/kamrankhan78694/Commentator/issues)
[![Stars](https://img.shields.io/github/stars/kamrankhan78694/Commentator.svg)](https://github.com/kamrankhan78694/Commentator/stargazers)
[![Forks](https://img.shields.io/github/forks/kamrankhan78694/Commentator.svg)](https://github.com/kamrankhan78694/Commentator/network)

**Commentator** is a liberating,  open-source, scalable, and disruptive project aimed at transforming web transparency through decentralized, community-driven feedback. As the future universal protocol for web commentary, it empowers users to leave comments on any website—including those that have disabled native comments or review systems—while guaranteeing censorship resistance, verified user identities, and permanent data ownership. By enabling open dialogue everywhere, it helps users make informed decisions and steer clear of scams.

**Why?** 

1. 
Commentator is a liberating, open-source platform reclaiming web transparency through decentralized, community-powered feedback.

2. 
Commentator sets the web free—with open-source, decentralized feedback driven by the people.

3. 
Commentator liberates the web—giving power back to the people through open, decentralized conversation.

4. 
Commentator is a liberating force against opaque algorithms—built open-source, scaled by community, and driven by transparency.

5. 
Commentator is a disruptive, liberating project forging a transparent web—where feedback is free and owned by everyone.

6. 
Free the web. Own your voice. Join Commentator.

7. 
Commentator is the liberating voice of the open web—decentralized, uncensored, and shaped by its users.



## 🚀 Disruptive Vision

Commentator is not just another commenting system—it's a **paradigm shift** toward:
- 🌐 **Universal Web Commentary**: Breaking the silos of platform-controlled feedback
- 👤 **Decentralized Ownership**: Users own their data and identity, not platforms
- 🛡️ **Censorship Resistance**: No single entity can silence community voices
- ✅ **Authentic Verification**: Cryptographic proof of user identity and content integrity
- 📈 **Global Scalability**: Designed to serve millions of users across any website, anywhere

---

## 🎯 Project Goal: Decentralization

Our long-term vision is to make Commentator a **fully decentralized public commenting system** that cannot be controlled or censored by any single entity.

### Key Objectives:
- 📊 **Decentralized Storage**: Store comment data on IPFS or Arweave using tools like `web3.storage` or `Bundlr`, ensuring content permanence and censorship resistance.
- 🔐 **Decentralized Identity (DID)**: Use Ethereum wallets (e.g., MetaMask) or identity protocols like ENS and Ceramic to allow users to sign comments without centralized accounts.
- 🗳️ **Community Moderation**: Implement upvote/downvote systems, and explore DAO-style moderation using token-based or reputation-based voting.
- ✅ **Content Integrity**: Let users cryptographically sign their comments for authenticity and verifiability.
- 🔗 **Open Protocol**: Create APIs and standards that can be used by other platforms to fetch or display Commentator data transparently.

This decentralized foundation ensures Commentator is not just a product—but a **disruptive protocol** that scales to serve the global community as a public utility.

## 📊 Scalability Targets

Our ambitious growth and technical targets make Commentator a **scalable technology** ready for global adoption:

### 📈 User Growth Roadmap
- **Phase 1 (MVP)**: 1,000 active users, 10,000 comments
- **Phase 2 (Beta)**: 50,000 active users, 500,000 comments  
- **Phase 3 (Scale)**: 1M active users, 10M comments
- **Phase 4 (Global)**: 10M+ active users, 100M+ comments

### ⚡ Performance Targets
- **Response Time**: Sub-500ms comment loading globally
- **Availability**: 99.9% uptime across distributed infrastructure
- **Scalability**: Handle 10,000+ concurrent comment submissions
- **Storage**: Petabyte-scale comment data on decentralized networks

### 🌍 Global Infrastructure
- **Multi-region Deployment**: Comments served from the nearest edge
- **Auto-scaling Architecture**: Dynamic resource allocation based on demand
- **CDN Distribution**: <100ms response times worldwide
- **Decentralized Redundancy**: No single points of failure

---

## 🚀 Features

### Current Capabilities
- ✅ **Universal Commenting** – Share feedback on any webpage, regardless of whether it supports native comments
- 🛡️ **Fraud Prevention** – Expose suspicious websites by enabling users to leave honest reviews
- 💬 **Open Participation** – Anyone can view or post comments without censorship
- 📖 **Fully Open-Source** – Transparent and community-driven, licensed under MIT
- 🔥 **Firebase Backend** – Persistent data storage with real-time synchronization
- 🔐 **Anonymous Authentication** – Secure commenting without account requirements
- ⚡ **Real-time Updates** – See new comments instantly without page refresh
- 📊 **Session Management** – User activity tracking and analytics support

### Disruptive Innovations in Development
- 🌐 **Cross-Platform Protocol** – Works seamlessly across browsers, mobile apps, and third-party integrations
- ✅ **Cryptographic Verification** – Tamper-proof comment authenticity and user identity
- 🏛️ **Community Governance** – DAO-based moderation with token-weighted voting systems
- 📊 **Permanent Storage** – Comments preserved forever on IPFS and Arweave networks
- 🔗 **Developer Ecosystem** – Open APIs enabling third-party innovation and integration

---

## 🔧 How It Works

1. Users install a browser extension or use the Commentator interface.
2. When visiting a website, they can leave or view comments tied to the domain or specific URL.
3. Comments are stored securely and rendered dynamically.
4. Others benefit from the collective feedback to make better web decisions.

---

## 🔥 Firebase Backend Integration

Commentator now features a **comprehensive Firebase Realtime Database backend** that provides persistent, real-time data storage and synchronization. This eliminates the previous mock data limitations and enables a fully functional commenting system.

### 🏗️ Backend Architecture

**Data Structure:**
```
commentator78694/
├── comments/
│   └── {urlHash}/
│       └── {commentId}: {
│           text: string,
│           author: string,
│           timestamp: number,
│           votes: number,
│           userId: string,
│           createdAt: number,
│           isNFT?: boolean,
│           nftId?: string,
│           ipfsUrl?: string
│       }
├── users/
│   └── {userId}: {
│       displayName: string,
│       email?: string,
│       walletAddress?: string,
│       createdAt: number,
│       lastActive: number
│   }
└── sessions/
    └── {sessionId}: {
        userId: string,
        createdAt: number,
        lastActivity: number,
        userAgent?: string,
        ipAddress?: string
    }
```

### 🔐 Security Rules

The Firebase security rules ensure:
- **Comments**: Public read access, authenticated write access with validation
- **Users**: User-specific read/write access for own data only  
- **Sessions**: Authenticated access with user ownership validation
- **Data Validation**: Strict type and length validation for all fields

### ⚡ Key Features

**Real-time Synchronization:**
- Comments appear instantly across all users without page refresh
- Live updates when new comments are posted
- Automatic cleanup of listeners when users leave pages

**Anonymous Authentication:**
- Secure anonymous user creation for commenting
- Generated display names for user privacy
- Session tracking for analytics and user engagement

**Persistent Data Storage:**
- All comments, user profiles, and sessions stored permanently
- Data survives page reloads and browser sessions
- URL-based comment organization using secure hashing

**Error Handling & User Experience:**
- Comprehensive error handling with user-friendly messages
- Loading states and feedback for all operations
- Graceful fallbacks when Firebase is unavailable

### 🚀 Firebase Service API

The `FirebaseService` module provides a complete API for data operations:

```javascript
// Authentication
await FirebaseService.initAuth()
FirebaseService.getCurrentUser()
FirebaseService.isUserAuthenticated()

// Comments
await FirebaseService.saveComment(url, commentData)
await FirebaseService.loadComments(url)
FirebaseService.subscribeToComments(url, callback)

// Users  
await FirebaseService.saveUserData(userData)
await FirebaseService.loadUserData(userId)

// Sessions
await FirebaseService.createSession(sessionData)
await FirebaseService.updateSessionActivity(sessionId)
await FirebaseService.closeSession(sessionId)
```

### 🔧 Configuration

**Firebase Configuration** (`firebase-config.js`):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDtzBKu_0uxIv6r3PaYuIphB1jCgMqdjEk",
  authDomain: "commentator78694.firebaseapp.com", 
  databaseURL: "https://commentator78694-default-rtdb.firebaseio.com",
  projectId: "commentator78694",
  // ... other config
};
```

**Database Rules** (`database.rules.json`):
```json
{
  "rules": {
    "comments": {
      "$urlHash": {
        ".read": true,
        ".write": "auth != null",
        // ... validation rules
      }
    }
  }
}
```

### 📊 Usage Examples

**Loading Comments for a URL:**
```javascript
const comments = await FirebaseService.loadComments('https://example.com');
console.log(`Found ${comments.length} comments`);
```

**Submitting a Comment:**
```javascript
const commentData = {
  text: "Great website!",
  author: "HappyUser123",
  votes: 0
};
const commentId = await FirebaseService.saveComment(url, commentData);
```

**Real-time Comment Updates:**
```javascript
const unsubscribe = FirebaseService.subscribeToComments(url, (comments) => {
  displayComments(comments);
});
// Call unsubscribe() when done
```

### 🌍 Production Deployment

For production use:

1. **Firebase Setup**: Configure your own Firebase project with Realtime Database
2. **Environment Configuration**: Update `firebase-config.js` with your project credentials  
3. **Security Rules**: Deploy the provided `database.rules.json` to your Firebase project
4. **Domain Verification**: Add your domain to Firebase Auth authorized domains

The current implementation uses a demo Firebase project suitable for development and testing.

---

## 🏗️ Comprehensive Application Blueprint

This section provides a comprehensive blueprint document for the Commentator webapp, covering the entire architecture from backend to frontend.

### System Architecture

#### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Side    │◄───►│  Server Side    │◄───►│   Database      │
│  (Frontend)     │     │  (Backend)      │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### Tech Stack

- **Frontend**: React.js, Redux, Styled Components
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (NoSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, AWS/Heroku

### Backend Components

#### Server Structure

```
src/
├── server/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── app.js            # Express application
└── index.js              # Entry point
```

#### API Endpoints

##### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and return token
- `GET /api/auth/me` - Get current user information

##### Comments

- `GET /api/comments` - Fetch all comments
- `GET /api/comments/:id` - Fetch specific comment
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/like` - Like a comment
- `POST /api/comments/:id/reply` - Reply to a comment

##### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/comments` - Get all comments by a user

#### Middleware

1. **Authentication Middleware**: Validates JWT tokens
2. **Error Handling Middleware**: Centralizes error handling
3. **Logging Middleware**: Records API requests and responses
4. **Rate Limiting Middleware**: Prevents abuse

#### Database Models

##### User Model

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String (URL),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

##### Comment Model

```javascript
{
  _id: ObjectId,
  content: String,
  author: { type: ObjectId, ref: 'User' },
  parentId: { type: ObjectId, ref: 'Comment' }, // For replies
  likes: [{ type: ObjectId, ref: 'User' }],
  contentId: String, // Identifies what the comment belongs to
  contentType: String, // Type of content (article, video, etc.)
  createdAt: Date,
  updatedAt: Date
}
```

### Frontend Components

#### Client Structure

```
src/
├── assets/          # Static files
├── components/      # Reusable UI components
│   ├── common/      # Shared components
│   ├── auth/        # Authentication components
│   └── comments/    # Comment-related components
├── hooks/           # Custom React hooks
├── pages/           # Application pages
├── redux/           # State management
│   ├── actions/     # Redux actions
│   ├── reducers/    # Redux reducers
│   └── store.js     # Redux store
├── services/        # API service calls
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.js           # Main component
└── index.js         # Entry point
```

#### Key Components

##### Comment Component

The core component that displays individual comments with:
- Author information
- Comment content
- Timestamp
- Like button
- Reply button
- Edit/Delete options (for owner)

##### CommentThread Component

Displays a hierarchical thread of comments with:
- Parent comment
- Nested replies
- Pagination
- Sorting options

##### CommentForm Component

Form for submitting new comments or replies with:
- Text area with rich text formatting
- Attachment options
- Preview functionality
- Submit button

##### UserProfile Component

Displays user information and activity:
- User details
- Comment history
- Liked comments

#### State Management

Redux store structure:

```javascript
{
  auth: {
    user: Object,
    isAuthenticated: Boolean,
    loading: Boolean,
    error: String
  },
  comments: {
    items: Array,
    current: Object,
    loading: Boolean,
    error: String
  },
  users: {
    profiles: Object,
    loading: Boolean,
    error: String
  }
}
```

### Data Flow

#### Adding a Comment

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │
│  User     │────►│  Frontend │────►│  Backend  │────►│  Database │
│  Action   │     │  Client   │     │  API      │     │           │
│           │     │           │     │           │     │           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
      │                                                     │
      │                ┌───────────┐                        │
      │                │           │                        │
      └───────────────►│  Updated  │◄───────────────────────┘
                       │  UI       │
                       │           │
                       └───────────┘
```

1. User fills out comment form and submits
2. Frontend validates input
3. Frontend sends POST request to API
4. Backend validates request and user authentication
5. Backend stores comment in database
6. Response sent back to client
7. Frontend updates UI with new comment

### Authentication Flow

#### JWT Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│         │     │             │     │              │
│  User   │────►│  Login Form │────►│  Submit to   │
│         │     │             │     │  Backend     │
└─────────┘     └─────────────┘     └──────────────┘
                                            │
┌─────────────┐     ┌─────────────┐         ▼
│             │     │             │    ┌──────────────┐
│  Access     │◄────│  Store JWT  │◄───│  Receive JWT │
│  Protected  │     │  in Storage │    │  from Server │
│  Resources  │     │             │    │              │
└─────────────┘     └─────────────┘    └──────────────┘
```

### Responsive Design

The frontend implements a responsive design approach:
- Mobile-first design philosophy
- Breakpoints for different device sizes
- Fluid layouts that adapt to screen dimensions
- Touch-friendly interactions for mobile users

### Performance Optimization

#### Backend Optimizations

- Database indexing for frequently queried fields
- Caching strategies for common requests
- Pagination to limit data transfer
- Efficient query handling

#### Frontend Optimizations

- Code splitting for faster initial loading
- Lazy loading of components and images
- Memoization of expensive computations
- Service worker for offline capabilities

### Security Measures

- HTTPS for all communications
- Input validation and sanitization
- Protection against XSS attacks
- CSRF protection
- Rate limiting to prevent brute force attempts
- Data encryption for sensitive information

### Deployment Strategy

#### Development Environment

- Local development with hot reloading
- Environment variables for configuration
- Docker containers for consistent development

#### CI/CD Pipeline

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │
│  Code     │────►│  Test     │────►│  Build    │────►│  Deploy   │
│  Commit   │     │  Suite    │     │  Process  │     │           │
│           │     │           │     │           │     │           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
```

- GitHub Actions for automated testing and deployment
- Staging environment for QA testing
- Blue-green deployment for zero downtime updates

### Monitoring and Analytics

- Error tracking with Sentry
- Application performance monitoring
- User behavior analytics
- A/B testing framework

### Future Enhancements

- Real-time commenting with WebSockets
- AI-powered content moderation
- Advanced rich text formatting
- Internationalization support
- Mobile applications (React Native)
- Extended notification system
- Social media integration

---

## 📦 Installation

_Coming Soon:_ Official browser extension and embeddable script.

### For Development

```bash
git clone https://github.com/kamrankhan78694/commentator.git
cd commentator
npm install
npm run dev
```

The development server will start on `http://localhost:3000`.

## 🚀 Getting Started

### Quick Start (No Build Required)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kamrankhan78694/commentator.git
   cd commentator
   ```

2. **Open the project**: Simply open `index.html` in your web browser to see the Commentator interface.

3. **Start contributing**: The project structure is organized as follows:
   - `index.html` - Main entry point and interface
   - `css/main.css` - Stylesheet with comprehensive styling
   - `js/main.js` - JavaScript functionality and interactivity
   - `assets/` - Directory for images and other static resources
   - `ROADMAP.md` - Development roadmap and milestones
   - `ARCHITECTURE.md` - Technical architecture documentation
   - `CONTRIBUTING.md` - Contribution guidelines and workflow

### Development Environment (Coming Soon)

Once the full development environment is set up, you'll be able to use:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production

## 🎨 Jekyll Theme

This project uses a **hybrid Jekyll architecture** that combines Jekyll's processing capabilities with custom static HTML/CSS/JS. The architecture leverages Jekyll's Minima theme as a foundation while implementing extensive custom overrides. The project is designed to be:

- **Hybrid Architecture**: Uses Jekyll for SEO/plugins with custom HTML content
- **Theme-enhanced**: Built on Minima theme with significant customizations
- **Customizable**: Easy to modify styling and layout through `css/main.css`
- **Responsive**: Mobile-first design with modern CSS practices

> 📋 **Architecture Details**: See [JEKYLL_ARCHITECTURE.md](JEKYLL_ARCHITECTURE.md) for comprehensive analysis of the current Jekyll theme setup, including configuration, directory structure, and optimization recommendations.

### Theme Customization

To customize the appearance:

1. **Colors & Typography**: Edit variables in `css/main.css` starting from line 23
2. **Layout**: Modify the grid systems and spacing in the layout components section
3. **Components**: Update individual component styles (buttons, cards, forms)
4. **Responsive Design**: Adjust breakpoints and mobile styles in the media queries section

**Current Architecture Enhancement:**

The project already uses Jekyll with the Minima theme configured in `_config.yml`. To enhance the current hybrid approach:

1. **Optimize Content Pages**: Add Jekyll front matter to `index.html` and docs pages:
   ```yaml
   ---
   layout: default
   title: "Page Title"
   description: "Page description"
   ---
   ```
2. **Leverage Theme Layouts**: Utilize `_layouts/default.html` for consistent structure
3. **Enhance SEO**: Take advantage of Jekyll's SEO plugins already configured
4. **See [JEKYLL_ARCHITECTURE.md](JEKYLL_ARCHITECTURE.md)** for detailed recommendations

**Alternative Theme Setup:**

If you want to switch to a different Jekyll theme:

1. Update `_config.yml` with your preferred theme:
   ```yaml
   theme: minima
   # or
   remote_theme: pages-themes/minimal@v0.2.0
   ```
2. Convert HTML files to Jekyll layouts in `_layouts/` directory
3. Add Jekyll front matter to content files
4. See [Jekyll Themes documentation](https://jekyllrb.com/docs/themes/) for more details

### Contributing

Ready to help build the future of decentralized web commentary? 

1. **📖 Read the Documentation**: 
   - [Development Roadmap](ROADMAP.md) - Understanding our path to disruption
   - [Technical Architecture](ARCHITECTURE.md) - System design and scalability
   - [Contributing Guidelines](CONTRIBUTING.md) - How to get involved

2. 🏗️ **Project Structure**: Start by exploring `index.html` to understand the UI components and layout
3. 🎨 **Styling**: CSS is organized in `css/main.css` with clear sections and comments
4. ⚡ **Functionality**: JavaScript interactions are in `js/main.js` with modular functions
5. 🚀 **Adding Features**: The comment interface in the demo section shows where core functionality will be implemented

### 🎯 How to Make an Impact

- 🐛 **Fix Bugs**: Improve existing functionality and edge cases
- ✨ **Build Features**: Implement Web3 integration and decentralization components
- 🏗️ **Scale Architecture**: Design systems for millions of users
- 📚 **Write Documentation**: Help others understand and contribute to the project
- 🧪 **Test & QA**: Ensure reliability across browsers and platforms
- 🌍 **Spread the Word**: Help build the community around decentralized commentary

**Join us in building technology that serves the public good!** 🚀
