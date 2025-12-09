import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import './Login.css';

export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err: any) {
            toast.error(error || 'Login failed. Please check your credentials.');
        }
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="password-input-wrapper">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    leftIcon={<FiLock />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

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
