import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card } from '../components/ui';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import * as orderService from '../services/order.service';
import type { Address } from '../services/order.service';
import toast from 'react-hot-toast';
import './Checkout.css';

export const Checkout = () => {
    const { cart, fetchCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

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

    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [sameasShipping, setSameAsShipping] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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

    const handlePlaceOrder = async () => {
        setIsLoading(true);
        try {
            const orderData: orderService.CreateOrderData = {
                shippingAddress,
                billingAddress: sameAsShipping ? shippingAddress : billingAddress,
                paymentMethod,
            };

            const order = await orderService.createOrder(orderData);
            toast.success('Order placed successfully!');
            navigate(`/orders/${order.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    const subtotal = cart?.subtotal || 0;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const orderTotal = subtotal + tax + shipping;

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

                <div className="checkout-grid">
                    <div className="checkout-main">
                        {/* Shipping Address */}
                        <Card className="checkout-section">
                            <h2>Shipping Address</h2>
                            <div className="form-grid">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={shippingAddress.fullName}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                                    }
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={shippingAddress.phone}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, phone: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    className="full-width"
                                    value={shippingAddress.street}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, street: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={shippingAddress.city}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={shippingAddress.state}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Postal Code"
                                    value={shippingAddress.postalCode}
                                    onChange={(e) =>
                                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                                    }
                                />
                            </div>
                        </Card>

                        {/* Payment Method */}
                        <Card className="checkout-section">
                            <h2>Payment Method</h2>
                            <div className="payment-methods">
                                <label>
                                    <input
                                        type="radio"
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    Credit Card
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    PayPal
                                </label>
                            </div>
                            <p className="payment-note">Payment processing will be implemented</p>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-sidebar">
                        <Card>
                            <h2>Order Summary</h2>
                            <div className="order-items">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <span>{item.product?.name} × {item.quantity}</span>
                                        <span>${(item.priceAtAdd * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Tax (10%):</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping:</span>
                                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="total-row total">
                                    <span>Total:</span>
                                    <span>${orderTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={isLoading}
                                className="place-order-btn"
                                size="lg"
                            >
                                {isLoading ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
