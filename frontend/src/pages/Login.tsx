import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button, Input, Card } from '../components/ui';
import './Login.css';

export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock login - will integrate with backend
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Form */}
                <motion.div
                    className="auth-form-section"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h1>Welcome Back!</h1>
                            <p>Sign in to continue shopping</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                leftIcon={<FiMail />}
                                required
                            />

                            <div className="password-input-wrapper">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    leftIcon={<FiLock />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    }
                                    required
                                />
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                            >
                                Sign In
                            </Button>

                            <div className="divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-login">
                                <button type="button" className="social-btn">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </button>
                                <button type="button" className="social-btn">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                            </div>

                            <p className="auth-footer">
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-link">
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </div>
                </motion.div>

                {/* Right Side - Visual */}
                <motion.div
                    className="auth-visual-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="visual-content">
                        <h2>Shop Smarter, Live Better</h2>
                        <p>Join thousands of happy customers already shopping with Cartify</p>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h3>50K+</h3>
                                <p>Products</p>
                            </div>
                            <div className="stat-item">
                                <h3>100K+</h3>
                                <p>Happy Customers</p>
                            </div>
                            <div className="stat-item">
                                <h3>4.9★</h3>
                                <p>Average Rating</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
