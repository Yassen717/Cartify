import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiCreditCard, FiPackage, FiCheck } from 'react-icons/fi';
import { Button, Card, PaymentForm } from '../components/ui';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import * as orderService from '../services/order.service';
import type { Address } from '../services/order.service';
import toast from 'react-hot-toast';
import './Checkout.css';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export const Checkout = () => {
    const { cart, fetchCart, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
    const [shippingAddress, setShippingAddress] = useState<Omit<Address, 'id'>>({
        type: 'SHIPPING',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
    });

    const [billingAddress, setBillingAddress] = useState<Omit<Address, 'id'>>({
        type: 'BILLING',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
    });

    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [isAuthenticated, navigate, fetchCart]);

    useEffect(() => {
        if (cart && (!cart.items || cart.items.length === 0)) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const subtotal = cart?.subtotal || 0;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const orderTotal = subtotal + tax + shipping;

    // Validate shipping form
    const validateShipping = (): boolean => {
        const errors: Record<string, string> = {};

        if (!shippingAddress.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        if (!shippingAddress.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        if (!shippingAddress.street.trim()) {
            errors.street = 'Street address is required';
        }
        if (!shippingAddress.city.trim()) {
            errors.city = 'City is required';
        }
        if (!shippingAddress.state.trim()) {
            errors.state = 'State is required';
        }
        if (!shippingAddress.postalCode.trim()) {
            errors.postalCode = 'Postal code is required';
        }

        setShippingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToPayment = () => {
        if (validateShipping()) {
            setCurrentStep('payment');
        } else {
            toast.error('Please fill in all required fields');
        }
    };

    const handlePaymentSuccess = async () => {
        setIsLoading(true);
        try {
            const orderData: orderService.CreateOrderData = {
                shippingAddress,
                billingAddress: sameAsShipping ? { ...shippingAddress, type: 'BILLING' } : billingAddress,
                paymentMethod: 'credit_card',
            };

            const response = await orderService.createOrder(orderData);
            await clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentError = (error: string) => {
        toast.error(error);
    };

    const steps = [
        { id: 'shipping', label: 'Shipping', icon: FiTruck },
        { id: 'payment', label: 'Payment', icon: FiCreditCard },
        { id: 'review', label: 'Complete', icon: FiPackage },
    ];

    if (!cart || !cart.items) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="checkout-loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>

                {/* Progress Steps */}
                <div className="checkout-steps">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                        return (
                            <div
                                key={step.id}
                                className={`checkout-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="step-icon">
                                    {isCompleted ? <FiCheck /> : <StepIcon />}
                                </div>
                                <span className="step-label">{step.label}</span>
                                {index < steps.length - 1 && <div className="step-connector" />}
                            </div>
                        );
                    })}
                </div>

                <div className="checkout-grid">
                    <div className="checkout-main">
                        {/* Shipping Address Step */}
                        {currentStep === 'shipping' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="checkout-section">
                                    <div className="section-header">
                                        <FiTruck className="section-icon" />
                                        <h2>Shipping Address</h2>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <input
                                                type="text"
                                                placeholder="Full Name *"
                                                value={shippingAddress.fullName}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                                                }
                                                className={shippingErrors.fullName ? 'error' : ''}
                                            />
                                            {shippingErrors.fullName && (
                                                <span className="field-error">{shippingErrors.fullName}</span>
                                            )}
                                        </div>
                                        <div className="form-field">
                                            <input
                                                type="tel"
                                                placeholder="Phone *"
                                                value={shippingAddress.phone}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                                                }
                                                className={shippingErrors.phone ? 'error' : ''}
                                            />
                                            {shippingErrors.phone && (
                                                <span className="field-error">{shippingErrors.phone}</span>
                                            )}
                                        </div>
                                        <div className="form-field full-width">
                                            <input
                                                type="text"
                                                placeholder="Street Address *"
                                                value={shippingAddress.street}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                                                }
                                                className={shippingErrors.street ? 'error' : ''}
                                            />
                                            {shippingErrors.street && (
                                                <span className="field-error">{shippingErrors.street}</span>
                                            )}
                                        </div>
                                        <div className="form-field">
                                            <input
                                                type="text"
                                                placeholder="City *"
                                                value={shippingAddress.city}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                                                }
                                                className={shippingErrors.city ? 'error' : ''}
                                            />
                                            {shippingErrors.city && (
                                                <span className="field-error">{shippingErrors.city}</span>
                                            )}
                                        </div>
                                        <div className="form-field">
                                            <input
                                                type="text"
                                                placeholder="State *"
                                                value={shippingAddress.state}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                                                }
                                                className={shippingErrors.state ? 'error' : ''}
                                            />
                                            {shippingErrors.state && (
                                                <span className="field-error">{shippingErrors.state}</span>
                                            )}
                                        </div>
                                        <div className="form-field">
                                            <input
                                                type="text"
                                                placeholder="Postal Code *"
                                                value={shippingAddress.postalCode}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                                                }
                                                className={shippingErrors.postalCode ? 'error' : ''}
                                            />
                                            {shippingErrors.postalCode && (
                                                <span className="field-error">{shippingErrors.postalCode}</span>
                                            )}
                                        </div>
                                        <div className="form-field">
                                            <select
                                                value={shippingAddress.country}
                                                onChange={(e) =>
                                                    setShippingAddress({ ...shippingAddress, country: e.target.value })
                                                }
                                            >
                                                <option value="USA">United States</option>
                                                <option value="CAN">Canada</option>
                                                <option value="GBR">United Kingdom</option>
                                                <option value="AUS">Australia</option>
                                                <option value="DEU">Germany</option>
                                                <option value="FRA">France</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="billing-toggle">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={sameAsShipping}
                                                onChange={(e) => setSameAsShipping(e.target.checked)}
                                            />
                                            <span>Billing address same as shipping</span>
                                        </label>
                                    </div>

                                    {!sameAsShipping && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="billing-section"
                                        >
                                            <h3>Billing Address</h3>
                                            <div className="form-grid">
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={billingAddress.fullName}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, fullName: e.target.value })
                                                    }
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone"
                                                    value={billingAddress.phone}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, phone: e.target.value })
                                                    }
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Street Address"
                                                    className="full-width"
                                                    value={billingAddress.street}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, street: e.target.value })
                                                    }
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    value={billingAddress.city}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, city: e.target.value })
                                                    }
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="State"
                                                    value={billingAddress.state}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, state: e.target.value })
                                                    }
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Postal Code"
                                                    value={billingAddress.postalCode}
                                                    onChange={(e) =>
                                                        setBillingAddress({ ...billingAddress, postalCode: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <Button
                                        onClick={handleContinueToPayment}
                                        size="lg"
                                        className="continue-btn"
                                    >
                                        Continue to Payment
                                    </Button>
                                </Card>
                            </motion.div>
                        )}

                        {/* Payment Step */}
                        {currentStep === 'payment' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="checkout-section">
                                    <div className="section-header">
                                        <FiCreditCard className="section-icon" />
                                        <h2>Payment Details</h2>
                                    </div>

                                    {/* Shipping Summary */}
                                    <div className="shipping-summary">
                                        <h4>Shipping to:</h4>
                                        <p>
                                            {shippingAddress.fullName}<br />
                                            {shippingAddress.street}<br />
                                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                                        </p>
                                        <button
                                            className="edit-link"
                                            onClick={() => setCurrentStep('shipping')}
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <PaymentForm
                                        amount={orderTotal}
                                        onPaymentSuccess={handlePaymentSuccess}
                                        onPaymentError={handlePaymentError}
                                        disabled={isLoading}
                                    />
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="checkout-sidebar">
                        <Card className="order-summary-card">
                            <h2>Order Summary</h2>
                            <div className="order-items">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-image">
                                            {item.product?.images?.[0]?.url ? (
                                                <img
                                                    src={item.product.images[0].url}
                                                    alt={item.product?.name}
                                                />
                                            ) : (
                                                <div className="image-placeholder">📦</div>
                                            )}
                                            <span className="item-quantity">{item.quantity}</span>
                                        </div>
                                        <div className="item-details">
                                            <span className="item-name">{item.product?.name}</span>
                                            <span className="item-price">
                                                ${(item.priceAtAdd * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'free' : ''}>
                                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="total-row">
                                    <span>Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="total-row total">
                                    <span>Total</span>
                                    <span>${orderTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {subtotal < 50 && (
                                <div className="free-shipping-notice">
                                    <FiTruck />
                                    <span>Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!</span>
                                </div>
                            )}
                        </Card>

                        {/* Security Badges */}
                        <div className="security-badges">
                            <div className="badge">
                                <span className="badge-icon">🔒</span>
                                <span>Secure<br/>Checkout</span>
                            </div>
                            <div className="badge">
                                <span className="badge-icon">🛡️</span>
                                <span>SSL<br/>Encrypted</span>
                            </div>
                            <div className="badge">
                                <span className="badge-icon">↩️</span>
                                <span>Easy<br/>Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
