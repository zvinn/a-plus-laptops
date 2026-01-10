# 💻 A Plus+ | Gaming Laptops Store

<div align="center">

![A Plus+ Logo](https://i.ibb.co/0jZ1Z1Q/a-plus-logo.png)

**High-Performance Gaming Laptops & Accessories**  
Official Dealer for ASUS, Lenovo, MSI, and Apple in Egypt

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://a-plus-laptops.vercel.app/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**A Plus+** is a modern e-commerce platform specializing in gaming laptops and high-performance computing devices. Built with React and Firebase, it provides a seamless shopping experience with features like:

- 🛒 Full-featured shopping cart
- 🔐 Secure authentication (Email & Google Sign-In)
- 📱 Progressive Web App (PWA) with offline support
- 🤖 AI-powered chatbot for customer support
- 📊 Real-time inventory management
- 🔍 Advanced product search and filtering
- ⚖️ Product comparison tool
- 📱 WhatsApp integration for orders
- 🌐 Multi-language support (Arabic/English)

---

## ✨ Features

### Customer Features
- **Product Catalog**: Browse laptops with detailed specifications
- **Smart Search**: AI-powered semantic search for finding the perfect laptop
- **Product Comparison**: Side-by-side comparison of up to 3 laptops
- **Shopping Cart**: Persistent cart with localStorage
- **Wishlist**: Save products for later
- **User Accounts**: Profile management and order history
- **Order Tracking**: Track your orders in real-time
- **Reviews**: Read and write product reviews
- **WhatsApp Checkout**: Complete purchases via WhatsApp
- **PWA**: Install as an app on mobile/desktop

### Admin Features
- **Dashboard**: Comprehensive analytics and stats
- **Product Management**: Add, edit, delete products
- **Order Management**: View and manage customer orders
- **User Management**: View registered users
- **Notifications**: Send push notifications to users

### Technical Features
- **Firebase Authentication**: Secure user login
- **Firestore Database**: Real-time data synchronization
- **PWA**: Service worker for offline functionality
- **Lazy Loading**: Code splitting for optimal performance
- **Error Boundaries**: Graceful error handling
- **Analytics**: Google Analytics & GTM integration
- **SEO Optimized**: Meta tags and structured data
- **Responsive Design**: Mobile-first approach

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite 7.2** - Build tool & dev server
- **React Router 6.28** - Client-side routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend & Services
- **Firebase**
  - Authentication (Email/Password, Google)
  - Firestore (NoSQL database)
  - Hosting
  - Cloud Messaging
- **EmailJS** - Email notifications
- **Google Analytics & GTM** - Usage tracking

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Testing Library** - Component testing

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Firebase Account** - [Sign up](https://console.firebase.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/a-plus-laptops.git
   cd a-plus-laptops
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to **Project Settings** > **General** > **Your apps**
   - Copy your Firebase config values into `.env`

3. **Configure EmailJS** (optional):
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Create a new service and template
   - Copy your service ID, template ID, and public key into `.env`

4. **Configure Google Analytics** (optional):
   - Create a GA4 property
   - Copy your Measurement ID into `.env`

5. **Configure reCAPTCHA** (optional):
   - Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Register your site
   - Copy your site key into `.env`

**⚠️ Important:** Never commit your `.env` file to Git!

### Running the App

1. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
a-plus-laptops/
├── public/                 # Static files
│   ├── pwa-*.png          # PWA icons
│   ├── robots.txt         # SEO robots file
│   └── sitemap.xml        # SEO sitemap
├── src/
│   ├── components/        # Reusable components (54 files)
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Chatbot.jsx
│   │   ├── ProductCard.jsx
│   │   └── ...
│   ├── pages/            # Page components (30 files)
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Checkout.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   ├── context/          # React Context providers (9 files)
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── WishlistContext.jsx
│   │   └── ...
│   ├── utils/            # Utility functions (7 files)
│   │   ├── analytics.js
│   │   ├── errorLogger.js
│   │   └── ...
│   ├── styles/           # Global styles
│   ├── firebase.js       # Firebase configuration
│   ├── translations.js   # i18n translations
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── .env                  # Environment variables (not in Git)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── firebase.json         # Firebase config
├── firestore.rules       # Firestore security rules
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
├── SECURITY.md           # Security policy
└── README.md             # This file
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |

---

## 🧪 Testing

We use **Vitest** and **React Testing Library** for testing.

**Run all tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Current test coverage:**
- Context APIs: 33% (3/9 files)
- Components: 2% (1/54 files)
- Pages: 3% (1/30 files)
- Utilities: 14% (1/7 files)

---

## 🚢 Deployment

### Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### Vercel (Current)

The app is currently deployed on Vercel:
- **Production**: [https://a-plus-laptops.vercel.app/](https://a-plus-laptops.vercel.app/)

**Deploy to Vercel:**
1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/)
3. Configure environment variables
4. Deploy

---

## 🔒 Security

We take security seriously. Please review our [Security Policy](SECURITY.md) for:
- How to report vulnerabilities
- Security best practices
- Supported versions

**⚠️ Important Security Notes:**
- Never commit `.env` file to Git
- Never share API keys publicly
- Use environment variables for all secrets
- Keep dependencies updated (`npm audit`)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick start:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Maintainer**: Mohamed Saad Ibrahim  
**Email**: mhamed.saad.ibrahim@gmail.com

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- React community for excellent libraries
- All contributors who help improve this project

---

<div align="center">

Made with ❤️ in Egypt 🇪🇬

**[⬆ Back to Top](#-a-plus--gaming-laptops-store)**

</div>
