import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import './Cart.css';

export const Cart = () => {
    const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="cart-empty">
                <div className="container">
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <FiShoppingBag />
                        </div>
                        <h2>Please login to view cart</h2>
                        <p>You need to be logged in to access your shopping cart</p>
                        <Link to="/login">
                            <Button size="lg">Login</Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isLoading && !cart) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="cart-loading">Loading your cart...</div>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="cart-empty">
                <div className="container">
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">
                            <FiShoppingBag />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet</p>
                        <Link to="/products">
                            <Button size="lg">Continue Shopping</Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    const subtotal = cart.subtotal || 0;
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Shopping Cart</h1>
                <p className="cart-subtitle">{cart.itemCount || 0} items in your cart</p>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.items.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card padding="lg" className="cart-item">
                                    <div className="item-image">
                                        <img
                                            src={item.product.images?.[0]?.url || 'https://via.placeholder.com/120'}
                                            alt={item.product.name}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.product.name}</h3>
                                        {item.variant && (
                                            <p className="item-variant">Variant: {item.variant.name}</p>
                                        )}
                                        <p className="item-price">${item.priceAtAdd}</p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={isLoading}
                                            >
                                                <FiMinus />
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                                disabled={isLoading}
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeItem(item.id)}
                                            disabled={isLoading}
                                        >
                                            <FiTrash2 /> Remove
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        <span className="item-total-label">Total:</span>
                                        <span className="item-total-price">${(item.priceAtAdd * item.quantity).toFixed(2)}</span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        <Card variant="glass" padding="lg">
                            <h3>Order Summary</h3>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-total">
                                <span>Total</span>
                                <span className="total-amount">${total.toFixed(2)}</span>
                            </div>

                            <Button fullWidth size="lg" rightIcon={<FiArrowRight />}>
                                Proceed to Checkout
                            </Button>

                            <Link to="/products" className="continue-shopping">
                                Continue Shopping
                            </Link>

                            {/* Promo Code */}
                            <div className="promo-section">
                                <p className="promo-label">Have a promo code?</p>
                                <div className="promo-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        className="promo-input"
                                    />
                                    <Button variant="outline">Apply</Button>
                                </div>
                            </div>

                            {/* Clear Cart */}
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear your cart?')) {
                                        clearCart();
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Clear Cart
                            </Button>
                        </Card>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <span className="badge-icon">🔒</span>
                                <span>Secure Checkout</span>
                            </div>
                            <div className="trust-badge">
                                <span className="badge-icon">🚚</span>
                                <span>{shipping === 0 ? 'Free Shipping Applied!' : 'Free Shipping Over $50'}</span>
                            </div>
                            <div className="trust-badge">
                                <span className="badge-icon">↩️</span>
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
