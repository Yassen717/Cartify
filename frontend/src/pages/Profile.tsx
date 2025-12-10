import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiShoppingBag, FiHeart, FiLogOut } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import './Profile.css';

export const Profile = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!user) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-loading">Loading...</div>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="profile-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>My Profile</h1>
                    <p className="profile-subtitle">Manage your account information</p>

                    <div className="profile-content">
                        {/* Profile Info Card */}
                        <Card variant="glass" padding="lg" className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <span className="avatar-text">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                </div>
                                <div className="profile-info">
                                    <h2>{user.firstName} {user.lastName}</h2>
                                    <p className="user-role">{user.role}</p>
                                </div>
                            </div>

                            <div className="profile-details">
                                <div className="detail-item">
                                    <FiMail className="detail-icon" />
                                    <div>
                                        <p className="detail-label">Email</p>
                                        <p className="detail-value">{user.email}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiUser className="detail-icon" />
                                    <div>
                                        <p className="detail-label">Name</p>
                                        <p className="detail-value">{user.firstName} {user.lastName}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiShoppingBag className="detail-icon" />
                                    <div>
                                        <p className="detail-label">Account Type</p>
                                        <p className="detail-value">{user.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <Button variant="outline" fullWidth>
                                    Edit Profile
                                </Button>
                                <Button variant="outline" fullWidth>
                                    Change Password
                                </Button>
                                <Button
                                    variant="danger"
                                    fullWidth
                                    leftIcon={<FiLogOut />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Links */}
                        <div className="profile-links">
                            <Card hover padding="lg" className="link-card">
                                <FiShoppingBag className="link-icon" />
                                <h3>My Orders</h3>
                                <p>View and track your orders</p>
                            </Card>

                            <Card hover padding="lg" className="link-card">
                                <FiHeart className="link-icon" />
                                <h3>Wishlist</h3>
                                <p>View your saved items</p>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
