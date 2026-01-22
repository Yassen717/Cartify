import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiGithub, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Footer.css';

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call for newsletter subscription
        // In a real app, this would call your backend API
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store subscription in localStorage (for portfolio demo)
            const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
            if (!subscriptions.includes(email)) {
                subscriptions.push(email);
                localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
            }

            setIsSubscribed(true);
            toast.success('Thank you for subscribing! 🎉');
            
            // Reset after 3 seconds
            setTimeout(() => {
                setIsSubscribed(false);
                setEmail('');
            }, 3000);
        } catch {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content">
                        <p className="newsletter-subtitle">Subscribe to receive updates on new arrivals, exclusive offers, and design inspiration delivered to your inbox.</p>
                        <form className="newsletter-form" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="newsletter-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting || isSubscribed}
                            />
                            <button 
                                type="submit" 
                                className={`newsletter-btn ${isSubscribed ? 'subscribed' : ''}`}
                                disabled={isSubmitting || isSubscribed}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="spinner" /> Subscribing...
                                    </>
                                ) : isSubscribed ? (
                                    <>
                                        <FiCheck /> Subscribed!
                                    </>
                                ) : (
                                    'Subscribe →'
                                )}
                            </button>
                        </form>
                        <p className="newsletter-disclaimer">
                            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                            <br />
                            <span className="newsletter-contact">Questions? Contact us at <a href="mailto:engyassenibrahim@gmail.com">engyassenibrahim@gmail.com</a></span>
                        </p>
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
