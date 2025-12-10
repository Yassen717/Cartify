import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<div className="container"><h1>Categories Page</h1></div>} />
          <Route path="/deals" element={<div className="container"><h1>Deals Page</h1></div>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<div className="container"><h1>Wishlist Page</h1></div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
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
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;
