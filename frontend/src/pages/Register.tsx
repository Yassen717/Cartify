import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import './Login.css';

export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const { register, isLoading, error, clearError } = useAuthStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        // Validate password strength (matching backend requirements)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (err: any) {
            // Error is already handled in store, but show toast with details
            const errorMessage = err.response?.data?.details 
                ? (Array.isArray(err.response.data.details) 
                    ? err.response.data.details.map((d: any) => d.message).join(', ')
                    : err.response.data.details)
                : (error || err.response?.data?.message || 'Registration failed. Please try again.');
            toast.error(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Visual */}
                <motion.div
                    className="auth-visual-section"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="visual-content">
                        <h2>Start Your Shopping Journey</h2>
                        <p>Create an account and unlock exclusive deals and personalized recommendations</p>
                        <div className="benefits-list">
                            <div className="benefit-item">
                                <span className="benefit-icon">🎁</span>
                                <span>Exclusive member deals</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">🚚</span>
                                <span>Free shipping on orders $50+</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">⭐</span>
                                <span>Earn rewards on every purchase</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">💝</span>
                                <span>Birthday surprises</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    className="auth-form-section"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h1>Create Account</h1>
                            <p>Join Cartify today</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="name-inputs">
                                <Input
                                    label="First Name"
                                    type="text"
                                    name="firstName"
                                    placeholder="John"
                                    leftIcon={<FiUser />}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    type="text"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                leftIcon={<FiMail />}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Create a strong password"
                                leftIcon={<FiLock />}
                                value={formData.password}
                                onChange={handleChange}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                }
                                helperText="At least 8 characters with uppercase, lowercase, number, and special character"
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                leftIcon={<FiLock />}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                }
                                required
                            />

                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <label className="terms-checkbox">
                                <input type="checkbox" required />
                                <span>
                                    I agree to the{' '}
                                    <Link to="/terms" className="terms-link">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="terms-link">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isLoading}
                            >
                                Create Account
                            </Button>

                            <p className="auth-footer">
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
