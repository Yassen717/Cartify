import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Lazy load all page components
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Products = lazy(() => import('./pages/Products').then(module => ({ default: module.Products })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Categories = lazy(() => import('./pages/Categories').then(module => ({ default: module.Categories })));
const Deals = lazy(() => import('./pages/Deals').then(module => ({ default: module.Deals })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(module => ({ default: module.Wishlist })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Orders = lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })));

// Admin Lazy Imports
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement'));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname, location.search]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin nested routes under a single AdminLayout route */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsManagement />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<OrdersManagement />} />
                <Route path="users" element={<UsersManagement />} />
              </Route>

              {/* 404 Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--white)' } },
            error: { iconTheme: { primary: 'var(--error)', secondary: 'var(--white)' } },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
