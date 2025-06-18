# 🗨️ Commentator

**Commentator** is an open-source project designed to improve transparency on the web by enabling community-driven feedback. It allows users to comment on any website—even those that disable native comments or review systems—helping others make informed decisions and avoid scams.

---

## 🎯 Project Goal: Decentralization

Our long-term vision is to make Commentator a **fully decentralized public commenting system** that cannot be controlled or censored by any single entity.

### Key Objectives:
- 🗂 **Decentralized Storage**: Store comment data on IPFS or Arweave using tools like `web3.storage` or `Bundlr`, ensuring content permanence and censorship resistance.
- 🆔 **Decentralized Identity (DID)**: Use Ethereum wallets (e.g., MetaMask) or identity protocols like ENS and Ceramic to allow users to sign comments without centralized accounts.
- 🗳️ **Community Moderation**: Implement upvote/downvote systems, and explore DAO-style moderation using token-based or reputation-based voting.
- 🔐 **Content Integrity**: Let users cryptographically sign their comments for authenticity and verifiability.
- 💡 **Open Protocol**: Create APIs and standards that can be used by other platforms to fetch or display Commentator data transparently.

This decentralized foundation ensures Commentator is not just a product—but a protocol that serves the public good.

---

## 🚀 Features

- ✅ **Universal Commenting** – Share feedback on any webpage, regardless of whether it supports native comments.
- 🛡️ **Fraud Prevention** – Expose suspicious websites by enabling users to leave honest reviews.
- 💬 **Open Participation** – Anyone can view or post comments without censorship.
- 🔓 **Fully Open-Source** – Transparent and community-driven, licensed under MIT.

---

## 🔧 How It Works

1. Users install a browser extension or use the Commentator interface.
2. When visiting a website, they can leave or view comments tied to the domain or specific URL.
3. Comments are stored securely and rendered dynamically.
4. Others benefit from the collective feedback to make better web decisions.

---

## 📦 Installation

_Coming Soon:_ Official browser extension and embeddable script.

For development purposes:

```bash
git clone https://github.com/kamrankhan78694/commentator.git
cd commentator
npm install
npm run dev
```

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

### Development Environment (Coming Soon)

Once the full development environment is set up, you'll be able to use:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Contributing

1. **Understanding the Structure**: Start by exploring `index.html` to understand the UI components and layout
2. **Styling**: CSS is organized in `css/main.css` with clear sections and comments
3. **Functionality**: JavaScript interactions are in `js/main.js` with modular functions
4. **Adding Features**: The comment interface in the demo section shows where core functionality will be implemented
