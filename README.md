# Cartify - Modern E-Commerce Platform

🛒 **[Live Demo: https://cartify-gold.vercel.app](https://cartify-gold.vercel.app)**

A full-stack e-commerce application built with React, TypeScript, Node.js, Express, and Prisma. Deployed on Vercel (frontend), Koyeb (backend), and Neon (PostgreSQL database).

## 🌐 Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [https://cartify-gold.vercel.app](https://cartify-gold.vercel.app) |
| Backend API | Koyeb | `https://revolutionary-farah-yassen-projects-c5696215.koyeb.app` |
| Database | Neon | PostgreSQL (managed) |

## 🎯 Project Overview

Cartify is a feature-rich e-commerce platform designed to provide an exceptional shopping experience with modern UI/UX, intelligent product discovery, and comprehensive order management.

## 📋 Key Features

### Product Discovery
- **Intuitive Navigation & UI/UX**: Clean, fast, and easy-to-use interface with clear categories and simple menu structure
- **Robust Search & Filtering**: Intelligent search with advanced filtering by price, category, and sort options
- **Product Gallery & Details**: High-quality images with multi-angle views and detailed product descriptions
- **Category Browsing**: Hierarchical category structure with category-specific filtering

### Pre-Purchase Tools
- **Wishlist / Save for Later**: Save items for future purchase
- **Reviews and Ratings**: Comprehensive system for customer feedback and product ratings
- **Product Variants**: Support for different sizes, colors, and other variants

### Shopping Experience
- **Shopping Cart**: Persistent cart with real-time updates
- **Checkout Process**: Streamlined checkout with address management
- **Order History**: Personal dashboard for viewing past orders

### Admin Panel
- **Dashboard**: Real-time statistics on revenue, orders, users, and products
- **Product Management**: Create, update, and delete products with images and variants
- **Order Management**: View and filter customer orders with status tracking
- **Low Stock Alerts**: Identify products that need restocking

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router 7.10.1
- **State Management**: Zustand 5.0.9
- **Data Fetching**: TanStack Query (React Query) 5.90.11
- **HTTP Client**: Axios 1.13.2
- **Form Handling**: React Hook Form 7.66.1
- **Validation**: Zod 4.1.13
- **UI Components**: Framer Motion 12.23.25 (animations), React Icons 5.5.0
- **Testing**: Vitest 4.0.16, React Testing Library
- **Notifications**: React Hot Toast 2.6.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1.0 with TypeScript
- **Database**: PostgreSQL (Neon) via Prisma
- **ORM**: Prisma 7.0.1
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation
- **Validation**: Zod 4.1.13
- **File Upload**: Multer 2.0.2
- **Image Processing**: Sharp 0.34.5
- **Caching**: Redis 5.10.0 with custom middleware (optional)
- **Testing**: Vitest 4.0.16, Supertest 7.1.4

### Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Koyeb
- **Database**: Neon (PostgreSQL)
- **CI/CD**: Automatic deployments via GitHub

### DevOps & Tools
- **Version Control**: Git
- **Code Quality**: ESLint 9.39.1, TypeScript 5.9.3
- **Process Management**: Nodemon 3.1.11 (development)

## 📁 Project Structure

```
cartify/
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # Layout components (Header, Footer, Layout)
│   │   │   └── ui/                  # Reusable UI components (Button, Card, Input, etc.)
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin panel pages
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ProductsManagement.tsx
│   │   │   │   ├── OrdersManagement.tsx
│   │   │   │   └── ProductForm.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Wishlist.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/                # API service layer
│   │   │   ├── api.ts               # Axios instance with interceptors
│   │   │   ├── auth.service.ts
│   │   │   ├── products.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── wishlist.service.ts
│   │   │   ├── admin.service.ts
│   │   │   └── ...
│   │   ├── stores/                  # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   ├── wishlistStore.ts
│   │   │   └── themeStore.ts
│   │   ├── types/                   # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/                   # Utility functions
│   │   │   └── imageUtils.ts
│   │   ├── styles/                  # Global styles
│   │   │   └── tokens.css
│   │   ├── test/                    # Test setup
│   │   │   └── setup.ts
│   │   ├── __tests__/               # Test files
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx
│   ├── public/                      # Static assets
│   │   └── *.webp                   # Product images
│   ├── .env.example
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   └── package.json
│
├── backend/                         # Node.js + Express backend
│   ├── src/
│   │   ├── __tests__/               # Unit tests
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── setup.ts
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts           # Prisma client
│   │   │   └── redis.ts             # Redis client
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── reviews.controller.ts
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── categories.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # Authentication & authorization
│   │   │   ├── cache.ts             # Redis caching
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   ├── upload.ts            # File upload handling
│   │   │   └── validate.ts          # Request validation
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── reviews.routes.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   ├── upload.routes.ts
│   │   │   ├── categories.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── cache.routes.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── errors.ts            # Custom error classes
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   ├── logger.ts            # Logging utilities
│   │   │   ├── image.utils.ts       # Image processing
│   │   │   └── validation.schemas.ts # Zod schemas
│   │   └── server.ts                # Express server setup
│   ├── prisma/                      # Database schema & migrations
│   │   ├── schema.prisma            # Prisma schema
│   │   ├── migrations/             # Database migrations
│   │   └── seed.ts                  # Database seeding
│   ├── uploads/                     # Uploaded files (generated at runtime)
│   ├── .env.example
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Redis (recommended for caching, optional for development)

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
   npm run prisma:generate
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
   - Health Check: http://localhost:3000/health

   Or visit the **live demo**: [https://cartify-gold.vercel.app](https://cartify-gold.vercel.app)

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"  # or PostgreSQL/MySQL connection string

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Redis (optional for development)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload
UPLOAD_MAX_SIZE=10485760  # 10MB in bytes
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Endpoints

### Health & Info
- `GET /health` - Health check endpoint
- `GET /` - API information

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - Get products with pagination and filters
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/:id/reviews` - Get product reviews

### Categories
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/products` - Get all products (admin view)
- `GET /api/admin/orders` - Get all orders (admin view)
- `PUT /api/admin/orders/:id/status` - Update order status

### Cache Management
- `POST /api/cache/invalidate` - Invalidate cache (Admin)
- `POST /api/cache/warm` - Warm cache (Admin)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run tests once
npm run test:coverage       # Generate coverage report
```

## 🔒 Security Features

- **CSRF Protection**: Token-based protection for all state-changing operations
- **Authentication**: JWT-based with refresh token rotation
- **Password Security**: Strong complexity requirements + Bcrypt hashing
- **Rate Limiting**: Multi-layer rate limiting (API, auth, uploads)
- **Input Validation**: Comprehensive Zod schemas for all endpoints
- **File Upload Security**: Strict validation, secure filenames, size limits
- **CORS**: Configured for specific origins with credential support
- **Security Headers**: Helmet middleware with CSP configuration
- **HTTPS Enforcement**: Automatic redirect in production
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy and input sanitization
- **Log Sanitization**: Automatic redaction of sensitive data in logs

📖 **For detailed security information, see [SECURITY.md](./SECURITY.md)**

📦 **For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading for all routes
- **Data Caching**: TanStack Query with 5-minute stale time
- **Image Optimization**: Sharp-based image processing and compression
- **Bundle Optimization**: Vite with tree-shaking

### Backend
- **Redis Caching**: Product and category caching with TTL
- **Cache Invalidation**: Pattern-based invalidation on mutations
- **Cache Warming**: Preload frequently accessed data on startup
- **Database Optimization**: Prisma with optimized queries
- **Graceful Shutdown**: Proper cleanup of connections

## 🔒 Rate Limiting

### General API Endpoints
- **Window**: 15 minutes
- **Limit**: 100 requests per IP

### Authentication Endpoints
- **Production**: 5 requests per 15 minutes
- **Development**: 50 requests per 5 minutes
- **Behavior**: Skips counting successful requests

## 🗃️ Database Schema

The application uses Prisma ORM with the following main models:

- **User & Authentication**: User, RefreshToken
- **Products & Categories**: Product, ProductImage, ProductVariant, ProductAttribute, Category
- **Shopping**: Cart, CartItem, Wishlist, Address
- **Orders**: Order, OrderItem, OrderTracking
- **Reviews & Ratings**: Review, ReviewImage, ReviewVote
- **Support**: SupportTicket, SupportMessage
- **Notifications**: Notification, NotificationPreference
- **Loyalty**: LoyaltyPoints, LoyaltyTransaction
- **Returns**: Return, ReturnItem

## 🚧 Database Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio
npx prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Yassen Ibrahim](https://github.com/Yassen717)
