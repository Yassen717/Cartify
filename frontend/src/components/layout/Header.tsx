import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import './Header.css';

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const { cart, fetchCart } = useCartStore();

    // Scroll detection for header styling
    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

                    <div className="spacer"></div>

                    {/* Search Bar */}
                    <div className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`}>
                        <FiSearch className="search-icon" />
                    </div>

                    {/* Actions */}
                    <div className="header-actions">
                        {isAuthenticated && user ? (
                            <Link to="/profile" className="action-btn">
                                <FiUser />
                            </Link>
                        ) : (
                            <Link to="/login" className="action-btn">
                                <FiUser />
                            </Link>
                        )}
                        <Link to="/cart" className="action-btn cart-btn">
                            <FiShoppingCart />
                            <span className="badge">0</span>
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
                    </motion.nav>
                )}
            </div>
        </motion.header>
    );
};
