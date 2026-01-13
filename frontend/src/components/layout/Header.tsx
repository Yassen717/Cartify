import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLayout } from 'react-icons/fi';
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import './Header.css';

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const { cart, fetchCart } = useCartStore();
    const { wishlist, fetchWishlist } = useWishlistStore();
    const navigate = useNavigate();

    // Scroll detection for header styling
    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    React.useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
            fetchWishlist();
        }
    }, [isAuthenticated, fetchCart, fetchWishlist]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchValue.trim();

        navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
        setIsSearchExpanded(false);
    };

    return (
        <motion.header
            className={`header glass ${isScrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <span className="logo-text">Cartify</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/products" className="nav-link">Products</Link>
                        <Link to="/categories" className="nav-link">Categories</Link>
                        <Link to="/deals" className="nav-link">Deals</Link>
                    </nav>

                    {/* Search Bar */}
                    <form
                        className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`}
                        onSubmit={handleSearchSubmit}
                    >
                        <button
                            type="button"
                            className="search-toggle"
                            onClick={() => setIsSearchExpanded((v) => !v)}
                            aria-label="Toggle search"
                        >
                            <FiSearch className="search-icon" />
                        </button>
                        <input
                            className="search-input"
                            type="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search products"
                        />
                    </form>

                    <div className="spacer"></div>

                    {/* Actions */}
                    <div className="header-actions">
                        {isAuthenticated && user ? (
                            <>
                                <Link to="/admin" className="action-btn" title="Dashboard">
                                    <FiLayout />
                                </Link>
                                <Link to="/profile" className="action-btn">
                                    <FiUser />
                                </Link>
                            </>
                        ) : (
                            <Link to="/login" className="action-btn">
                                <FiUser />
                            </Link>
                        )}
                        <Link to="/wishlist" className="action-btn cart-btn" aria-label="Wishlist">
                            <FiHeart />
                            <span className="badge">{wishlist?.itemCount || 0}</span>
                        </Link>
                        <Link to="/cart" className="action-btn cart-btn">
                            <FiShoppingCart />
                            <span className="badge">{cart?.items?.length || 0}</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <motion.nav
                        className="nav-mobile"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Link to="/" className="nav-link-mobile">Home</Link>
                        <Link to="/products" className="nav-link-mobile">Products</Link>
                        <Link to="/categories" className="nav-link-mobile">Categories</Link>
                        <Link to="/deals" className="nav-link-mobile">Deals</Link>
                        {isAuthenticated && (
                            <Link to="/admin" className="nav-link-mobile">Dashboard</Link>
                        )}
                        <Link to="/wishlist" className="nav-link-mobile">Wishlist</Link>
                    </motion.nav>
                )}
            </div>
        </motion.header>
    );
};
