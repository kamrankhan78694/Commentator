# <img src="assets/logo-light.svg" alt="Commentator" height="40"> Commentator

**Commentator** is **an open-source disruptive, scalable project** designed to revolutionize web transparency through decentralized, community-driven feedback. As the future **universal protocol for web commentary**, it enables users to comment on any website—even those that disable native comments or review systems—while ensuring censorship resistance, authentic user identity, and permanent data ownership.

## 🚀 Disruptive Vision

Commentator is not just another commenting system—it's a **paradigm shift** toward:
- **Universal Web Commentary**: Breaking the silos of platform-controlled feedback
- **Decentralized Ownership**: Users own their data and identity, not platforms
- **Censorship Resistance**: No single entity can silence community voices
- **Authentic Verification**: Cryptographic proof of user identity and content integrity
- **Global Scalability**: Designed to serve millions of users across any website, anywhere

---

## 🎯 Project Goal: Decentralization

Our long-term vision is to make Commentator a **fully decentralized public commenting system** that cannot be controlled or censored by any single entity.

### Key Objectives:
- 🗂 **Decentralized Storage**: Store comment data on IPFS or Arweave using tools like `web3.storage` or `Bundlr`, ensuring content permanence and censorship resistance.
- 🆔 **Decentralized Identity (DID)**: Use Ethereum wallets (e.g., MetaMask) or identity protocols like ENS and Ceramic to allow users to sign comments without centralized accounts.
- 🗳️ **Community Moderation**: Implement upvote/downvote systems, and explore DAO-style moderation using token-based or reputation-based voting.
- 🔐 **Content Integrity**: Let users cryptographically sign their comments for authenticity and verifiability.
- 💡 **Open Protocol**: Create APIs and standards that can be used by other platforms to fetch or display Commentator data transparently.

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
- 🔓 **Fully Open-Source** – Transparent and community-driven, licensed under MIT

### Disruptive Innovations in Development
- 🌐 **Cross-Platform Protocol** – Works seamlessly across browsers, mobile apps, and third-party integrations
- 🔐 **Cryptographic Verification** – Tamper-proof comment authenticity and user identity
- 📊 **Community Governance** – DAO-based moderation with token-weighted voting systems
- 🗂️ **Permanent Storage** – Comments preserved forever on IPFS and Arweave networks
- 💡 **Developer Ecosystem** – Open APIs enabling third-party innovation and integration

---

## 🔧 How It Works

1. Users install a browser extension or use the Commentator interface.
2. When visiting a website, they can leave or view comments tied to the domain or specific URL.
3. Comments are stored securely and rendered dynamically.
4. Others benefit from the collective feedback to make better web decisions.

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

This project uses **custom static HTML/CSS/JS** architecture rather than a traditional Jekyll theme. However, if deployed via GitHub Pages, it may use Jekyll's default processing. The project is designed to be:

- **Theme-agnostic**: Works as a standalone HTML project or with GitHub Pages
- **Customizable**: Easy to modify styling and layout through `css/main.css`
- **Responsive**: Mobile-first design with modern CSS practices

### Theme Customization

To customize the appearance:

1. **Colors & Typography**: Edit variables in `css/main.css` starting from line 23
2. **Layout**: Modify the grid systems and spacing in the layout components section
3. **Components**: Update individual component styles (buttons, cards, forms)
4. **Responsive Design**: Adjust breakpoints and mobile styles in the media queries section

If you want to use a Jekyll theme instead:

1. Create a `_config.yml` file with your preferred theme:
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

2. **🏗️ Project Structure**: Start by exploring `index.html` to understand the UI components and layout
3. **🎨 Styling**: CSS is organized in `css/main.css` with clear sections and comments
4. **⚡ Functionality**: JavaScript interactions are in `js/main.js` with modular functions
5. **🚀 Adding Features**: The comment interface in the demo section shows where core functionality will be implemented

### 🎯 How to Make an Impact

- **🐛 Fix Bugs**: Improve existing functionality and edge cases
- **✨ Build Features**: Implement Web3 integration and decentralization components
- **🏗️ Scale Architecture**: Design systems for millions of users
- **📚 Write Documentation**: Help others understand and contribute to the project
- **🧪 Test & QA**: Ensure reliability across browsers and platforms
- **🌍 Spread the Word**: Help build the community around decentralized commentary

**Join us in building technology that serves the public good!** 🚀
