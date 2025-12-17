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
                                <span className="footer-logo">Maison</span>
                                <p className="footer-tagline">
                                    Curating timeless pieces that bring warmth and elegance to every space. Crafted with care, designed for life.
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

                        {/* Shop Links */}
                        <div className="footer-section">
                            <h4>Shop</h4>
                            <ul className="footer-links">
                                <li><Link to="/products">New Arrivals</Link></li>
                                <li><Link to="/deals">Best Sellers</Link></li>
                                <li><Link to="/categories">Living Room</Link></li>
                                <li><Link to="/products">Bedroom</Link></li>
                                <li><Link to="/products">Kitchen</Link></li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div className="footer-section">
                            <h4>Company</h4>
                            <ul className="footer-links">
                                <li><Link to="/about">Our Story</Link></li>
                                <li><Link to="/sustainability">Sustainability</Link></li>
                                <li><Link to="/careers">Careers</Link></li>
                                <li><Link to="/press">Press</Link></li>
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div className="footer-section">
                            <h4>Support</h4>
                            <ul className="footer-links">
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/faq">FAQs</Link></li>
                                <li><Link to="/shipping">Shipping</Link></li>
                                <li><Link to="/returns">Returns</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="footer-bottom">
                        <p>&copy; 2024 Maison. All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};
