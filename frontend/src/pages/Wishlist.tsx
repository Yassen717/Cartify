import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import './Wishlist.css';

export const Wishlist = () => {
    const { wishlist, isLoading, fetchWishlist, removeItem, moveToCart } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="wishlist-empty">
                <div className="container">
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <FiHeart />
                        </div>
                        <h2>Please login to view wishlist</h2>
                        <p>Save your favorite items for later</p>
                        <Link to="/login">
                            <Button size="lg">Login</Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isLoading && !wishlist) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="wishlist-loading">Loading your wishlist...</div>
                </div>
            </div>
        );
    }

    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
        return (
            <div className="wishlist-empty">
                <div className="container">
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <FiHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love for later</p>
                        <Link to="/products">
                            <Button size="lg" leftIcon={<FiArrowRight />}>
                                Start Shopping
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>My Wishlist</h1>
                    <p className="wishlist-subtitle">
                        {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} saved
                    </p>

                    {/* Wishlist Grid */}
                    <div className="wishlist-grid">
                        {wishlist.items.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                            >
                                <Card hover padding="none" className="wishlist-item">
                                    <div className="wishlist-image">
                                        <Link to={`/products/${item.productId}`}>
                                            <img
                                                src={item.product.images?.[0]?.url || 'https://via.placeholder.com/400'}
                                                alt={item.product.name}
                                            />
                                        </Link>

                                        {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                                            <div className="discount-badge">
                                                {Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>

                                    <div className="wishlist-info">
                                        <Link to={`/products/${item.productId}`}>
                                            <h3>{item.product.name}</h3>
                                        </Link>

                                        <div className="wishlist-pricing">
                                            <span className="current-price">${item.product.price}</span>
                                            {item.product.comparePrice && (
                                                <span className="compare-price">${item.product.comparePrice}</span>
                                            )}
                                        </div>

                                        {item.product.stockQty === 0 && (
                                            <p className="out-of-stock">Out of Stock</p>
                                        )}

                                        <div className="wishlist-actions">
                                            <Button
                                                fullWidth
                                                leftIcon={<FiShoppingCart />}
                                                onClick={() => moveToCart(item.productId)}
                                                disabled={item.product.stockQty === 0 || isLoading}
                                            >
                                                Move to Cart
                                            </Button>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeItem(item.productId)}
                                                disabled={isLoading}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Action Footer */}
                    <div className="wishlist-footer">
                        <Card variant="glass" padding="lg">
                            <div className="footer-content">
                                <div>
                                    <h3>Ready to checkout?</h3>
                                    <p>Move your favorite items to cart</p>
                                </div>
                                <Link to="/cart">
                                    <Button size="lg" rightIcon={<FiArrowRight />}>
                                        View Cart
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
