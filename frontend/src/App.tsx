import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
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
          <Route path="/cart" element={<div className="container"><h1>Cart Page</h1></div>} />
          <Route path="/wishlist" element={<div className="container"><h1>Wishlist Page</h1></div>} />
          <Route path="/profile" element={<div className="container"><h1>Profile Page</h1></div>} />
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
