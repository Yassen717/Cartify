# Cartify - Modern E-Commerce Platform

A full-stack e-commerce application built with React, TypeScript, Node.js, Express, and Prisma (SQLite/libSQL by default).

## 🎯 Project Overview

Cartify is a feature-rich e-commerce platform designed to provide an exceptional shopping experience with modern UI/UX, intelligent product discovery, and comprehensive order management.

## 📋 Key Features

### Product Discovery
- **Intuitive Navigation & UI/UX**: Clean, fast, and easy-to-use interface with clear categories and simple menu structure
- **Robust Search & Filtering**: Intelligent search with advanced filtering by price, size, color, brand, and rating
- **Product Gallery & Details**: High-quality images with zoom, multi-angle views, and detailed product descriptions
- **Personalized Recommendations**: AI-driven suggestions based on browsing history and past purchases

### Pre-Purchase Tools
- **Wishlist / Save for Later**: Save items for future purchase
- **Reviews and Ratings**: Comprehensive system for customer feedback and product ratings

### Order Management
- **Real-Time Order Tracking**: Monitor shipment status and expected delivery dates
- **Order History**: Personal dashboard for viewing past orders and facilitating re-ordering
- **Easy Returns & Refunds**: Simple, intuitive in-app process for returns and refund tracking

### Engagement Features
- **Push Notifications & Alerts**: Timely updates for sales, new arrivals, order status, and abandoned cart reminders
- **Customer Service / Support**: Multiple channels including live chat, AI chatbot, and comprehensive FAQ
- **Loyalty & Membership**: Rewards points tracking, exclusive deals, and personalized discounts

## 🏗️ Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: Zustand / Context API
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: CSS Modules / Styled Components
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite/libSQL (default via Prisma adapter)
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer
- **Image Processing**: Sharp

### DevOps & Tools
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Caching (optional)**: Redis

## 📁 Project Structure

```
cartify/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Express server setup
│   ├── prisma/            # Database schema & migrations
│   └── package.json
│
├── tasks.md               # Development task checklist
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- (Optional) Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cartify
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file (DATABASE_URL defaults to a local SQLite file)
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure your .env file with API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📚 Documentation

- Frontend: `frontend/README.md`
- Backend environment: `backend/.env.example`

## 🧪 Testing

```bash
# Backend currently has no automated tests configured.
# Frontend uses Vite + ESLint; add tests as needed.
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Lazy loading for routes and images
- Database query optimization with indexes
- Caching strategies (Redis ready)
- CDN for static assets
- Image optimization and compression
- Code splitting and tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- Development Team: [Your Team]
- Project Manager: [Name]
- Design: [Name]

## 📞 Support

For support, email support@cartify.com or join our Slack channel.

---

Built with ❤️ by the Cartify Team
