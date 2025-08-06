# Seller Dashboard for Small Vendors

## Project Overview

A comprehensive full-stack dashboard application designed for small vendors to manage their e-commerce operations efficiently. This application provides a user-friendly interface with Amazon-like styling for managing orders, inventory, and analyzing business performance.

## Core Features

### Authentication & User Management

- Secure login and registration system
- Role-based access control (Admin/Seller)
- Protected routes and API endpoints
- User profile management

### Dashboard & Analytics

- Real-time sales metrics
- Revenue tracking and analysis
- Performance trends visualization
- Custom date range filtering

### Order Management

- Comprehensive order listing and details
- Order status tracking and updates
- Automated invoice generation
- Bulk order processing
- Order history and analytics

### Inventory Management

- Real-time stock tracking
- Low stock alerts
- Product categorization
- Bulk import/export functionality
- Stock history and trends

### Reporting System

- Sales reports with charts and graphs
- Inventory status reports
- Low stock reports
- Exportable reports in multiple formats
- Custom date range filtering

## Tech Stack (MERN)

### Frontend Technologies

- React.js 18+ for UI components
- Material-UI (MUI) for styled components
- React Router v6 for navigation
- Recharts for data visualization
- Axios for API requests
- Context API for state management

### Backend Technologies

- Node.js 16+ runtime
- Express.js for REST API
- MongoDB for database
- JWT for authentication
- Mongoose for ODM
- PDF generation for invoices

## Project Structure

```bash
seller-dashboard/
│
├── backend/
│   ├── config/
│   │   └── db.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   └── admin.js       # Admin role checks
│   ├── models/
│   │   ├── User.js        # User schema
│   │   ├── Order.js       # Order schema
│   │   └── Stock.js       # Inventory schema
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── orders.js      # Order management
│   │   └── stock.js       # Inventory management
│   └── server.js          # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/    # Layout components
│   │   │   └── common/    # Reusable components
│   │   ├── pages/
│   │   │   ├── auth/      # Login/Register
│   │   │   ├── dashboard/ # Main dashboard
│   │   │   ├── orders/    # Order management
│   │   │   └── inventory/ # Stock management
│   │   ├── context/       # React Context
│   │   ├── services/      # API services
│   │   ├── styles/        # Global styles
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .env.example           # Environment variables template
├── .gitignore
└── README.md
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Environment Setup

1. Clone the repository
2. Create `.env` file in the backend directory:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seller-dashboard
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Available Scripts

### Backend Commands

- `npm start` - Start the server
- `npm run dev` - Start with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Frontend Commands

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject CRA config

## API Documentation

The API endpoints are available at `/api` with the following routes:

- `/api/auth` - Authentication endpoints
- `/api/orders` - Order management
- `/api/stock` - Inventory management
- `/api/dashboard` - Dashboard metrics
- `/api/reports` - Report generation

## Deployment

The application is deployed on Render:

- Backend API: [https://your-backend.onrender.com/api](https://your-backend.onrender.com/api)
- Frontend App: [https://your-frontend.onrender.com](https://your-frontend.onrender.com)

### Deployment Steps

1. Push code to GitHub
2. Connect Render to GitHub repository
3. Configure environment variables
4. Deploy backend service
5. Deploy frontend static site

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
