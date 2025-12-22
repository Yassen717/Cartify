import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';
import './Footer.css';

export const Footer = () => {
    return (
        <>
            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <p className="newsletter-subtitle">Subscribe to receive updates on new arrivals, exclusive offers, and design inspiration delivered to your inbox.</p>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="newsletter-input"
                            />
                            <button className="newsletter-btn">
                                Subscribe →
                            </button>
                        </div>
                        <p className="newsletter-disclaimer">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        {/* Brand Section */}
                        <div className="footer-section">
                            <div className="footer-brand">
                                <span className="footer-logo">Cartify</span>
                                <p className="footer-tagline">
                                    Your one‑stop shop for electronics, fashion, home, and more — great prices, fast delivery, and secure checkout.
                                </p>
                            </div>
                            <div className="social-links">
                                <a href="https://instagram.com" className="social-link" aria-label="Instagram">
                                    <FiInstagram />
                                </a>
                                <a href="https://twitter.com" className="social-link" aria-label="Twitter">
                                    <FiTwitter />
                                </a>
                                <a href="https://facebook.com" className="social-link" aria-label="Facebook">
                                    <FiFacebook />
                                </a>
                                <a href="https://github.com" className="social-link" aria-label="LinkedIn">
                                    <FiGithub />
                                </a>
                            </div>
                        </div>

                        {/* Shop Links (existing routes) */}
                        <div className="footer-section">
                            <h4>Shop</h4>
                            <ul className="footer-links">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/products">Products</Link></li>
                                <li><Link to="/categories">Categories</Link></li>
                                <li><Link to="/deals">Deals</Link></li>
                                <li><Link to="/checkout">Checkout</Link></li>
                            </ul>
                        </div>

                        {/* My Account (existing routes) */}
                        <div className="footer-section">
                            <h4>My Account</h4>
                            <ul className="footer-links">
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                                <li><Link to="/profile">Profile</Link></li>
                            </ul>
                        </div>

                        {/* My Activity (existing routes) */}
                        <div className="footer-section">
                            <h4>My Activity</h4>
                            <ul className="footer-links">
                                <li><Link to="/cart">Cart</Link></li>
                                <li><Link to="/wishlist">Wishlist</Link></li>
                                <li><Link to="/orders">Orders</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar - only existing links */}
                    <div className="footer-bottom">
                        <p>&copy; 2024 Cartify. All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <Link to="/">Home</Link>
                            <Link to="/products">Products</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};
