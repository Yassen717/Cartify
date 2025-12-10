import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './Header.css';

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const { isAuthenticated, user } = useAuthStore();

    return (
        <motion.header
            className="header glass"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <span className="logo-icon">🛍️</span>
                        <span className="logo-text text-gradient">Cartify</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/products" className="nav-link">Products</Link>
                        <Link to="/categories" className="nav-link">Categories</Link>
                        <Link to="/deals" className="nav-link">Deals</Link>
                    </nav>

                    {/* Search Bar */}
                    <div className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            onFocus={() => setIsSearchExpanded(true)}
                            onBlur={() => setIsSearchExpanded(false)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="header-actions">
                        <Link to="/wishlist" className="action-btn">
                            <FiHeart />
                            <span className="badge">3</span>
                        </Link>
                        <Link to="/cart" className="action-btn">
                            <FiShoppingCart />
                            <span className="badge pulse">5</span>
                        </Link>

                        {isAuthenticated && user ? (
                            <Link to="/profile" className="user-profile-btn">
                                <div className="user-avatar">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <span className="user-name">{user.firstName}</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="action-btn">
                                <FiUser />
                            </Link>
                        )}
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
