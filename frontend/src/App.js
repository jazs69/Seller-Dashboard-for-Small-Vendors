import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Order Pages
import Orders from './pages/orders/Orders';
import OrderForm from './pages/orders/OrderForm';
import Invoice from './pages/orders/Invoice';

// Inventory Pages
import Stock from './pages/inventory/Stock';
import StockForm from './pages/inventory/StockForm';

// Report Pages
import Reports from './pages/reports/Reports';

// Profile Pages
import Profile from './pages/profile/Profile';

// Route Protection
import PrivateRoute from './components/routing/PrivateRoute';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Orders Routes */}
              <Route path="orders" element={<Orders />} />
              <Route path="orders/new" element={<OrderForm />} />
              <Route path="orders/invoice/:id" element={<Invoice />} />
              
              {/* Inventory Routes */}
              <Route path="inventory" element={<Stock />} />
              <Route path="inventory/new" element={<StockForm />} />
              <Route path="inventory/edit/:id" element={<StockForm />} />
              
              {/* Reports Routes */}
              <Route path="reports" element={<Reports />} />
              
              {/* Profile Routes */}
              <Route path="profile" element={<Profile />} />
              
              {/* Redirect any unknown routes to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;