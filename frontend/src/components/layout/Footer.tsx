import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';
import './Footer.css';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-section">
                        <div className="footer-brand">
                            <span className="footer-logo text-gradient">Cartify</span>
                            <p className="footer-tagline">
                                Your premium shopping destination for quality products
                            </p>
                        </div>
                        <div className="social-links">
                            <a href="https://facebook.com" className="social-link" aria-label="Facebook">
                                <FiFacebook />
                            </a>
                            <a href="https://twitter.com" className="social-link" aria-label="Twitter">
                                <FiTwitter />
                            </a>
                            <a href="https://instagram.com" className="social-link" aria-label="Instagram">
                                <FiInstagram />
                            </a>
                            <a href="https://github.com" className="social-link" aria-label="GitHub">
                                <FiGithub />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Shop</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                            <li><Link to="/deals">Special Deals</Link></li>
                            <li><Link to="/new-arrivals">New Arrivals</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/shipping">Shipping Info</Link></li>
                            <li><Link to="/returns">Returns</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-section">
                        <h4>Newsletter</h4>
                        <p>Subscribe for exclusive offers and updates</p>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="newsletter-input"
                            />
                            <button className="newsletter-btn">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p>&copy; 2024 Cartify. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
