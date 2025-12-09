import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import { Link } from 'react-router-dom';
import './Cart.css';

export const Cart = () => {
    // Mock cart data - will be replaced with state management
    const cartItems = [
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 199.99,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
            variant: 'Black',
        },
        {
            id: 2,
            name: 'Smart Watch Pro',
            price: 299.99,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            variant: 'Silver',
        },
        {
            id: 3,
            name: 'Laptop Stand',
            price: 49.99,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
            variant: 'Aluminum',
        },
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
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

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Shopping Cart</h1>
                <p className="cart-subtitle">{cartItems.length} items in your cart</p>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card padding="lg" className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-variant">Variant: {item.variant}</p>
                                        <p className="item-price">${item.price}</p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button className="qty-btn">
                                                <FiMinus />
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn">
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <button className="remove-btn">
                                            <FiTrash2 /> Remove
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        <span className="item-total-label">Total:</span>
                                        <span className="item-total-price">${(item.price * item.quantity).toFixed(2)}</span>
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
                                <span>${shipping.toFixed(2)}</span>
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
                        </Card>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <span className="badge-icon">🔒</span>
                                <span>Secure Checkout</span>
                            </div>
                            <div className="trust-badge">
                                <span className="badge-icon">🚚</span>
                                <span>Free Shipping</span>
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
