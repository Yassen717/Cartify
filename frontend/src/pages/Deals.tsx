import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { FiClock, FiShoppingCart, FiTrendingUp, FiZap, FiPercent } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import * as productsService from '../services/products.service';
import type { Product } from '../services/products.service';
import { getProductImage } from '../utils/imageUtils';
import toast from 'react-hot-toast';
import './Deals.css';

// Calculate end of day for deal countdown
const getEndOfDay = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
};

export const Deals = () => {
    const [deals, setDeals] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    // Real countdown timer
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = getEndOfDay();
            const difference = endOfDay.getTime() - now.getTime();

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        setIsLoading(true);
        try {
            // Fetch products and filter those with comparePrice (deals/discounts)
            const response = await productsService.getProducts({
                page: 1,
                limit: 20,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            // Filter products that have comparePrice (indicating a discount)
            const dealsProducts = response.data.products.filter(
                (product) => product.comparePrice && product.comparePrice > product.price
            );

            setDeals(dealsProducts);
        } catch (error) {
            toast.error('Failed to load deals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (productId: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        try {
            await addItem(productId, 1);
        } catch (error) {
            // Error already handled in store
        }
    };

    const calculateDiscount = (price: number, comparePrice: number) => {
        return Math.round(((comparePrice - price) / comparePrice) * 100);
    };

    // Calculate dynamic stats from actual deals
    const dealStats = useMemo(() => {
        if (deals.length === 0) {
            return { maxDiscount: 0, totalSavings: 0, lowStockCount: 0 };
        }

        let maxDiscount = 0;
        let totalSavings = 0;
        let lowStockCount = 0;

        deals.forEach((deal) => {
            if (deal.comparePrice) {
                const discount = calculateDiscount(deal.price, deal.comparePrice);
                if (discount > maxDiscount) maxDiscount = discount;
                totalSavings += deal.comparePrice - deal.price;
            }
            if (deal.stockQty <= 5) lowStockCount++;
        });

        return { maxDiscount, totalSavings, lowStockCount };
    }, [deals]);

    // Format time with leading zero
    const formatTime = (value: number) => value.toString().padStart(2, '0');

    return (
        <div className="deals-page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="deals-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="deals-title-section">
                        <h1>Today's Deals</h1>
                        <p className="deals-subtitle">
                            Limited time offers - grab them before they're gone!
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    <Card variant="gradient" padding="md" className="countdown-card">
                        <div className="countdown-label">
                            <FiClock />
                            <span>Today's deals end in:</span>
                        </div>
                        <div className="countdown-timer">
                            <div className="time-unit">
                                <span className="time-value">{formatTime(timeLeft.hours)}</span>
                                <span className="time-label">Hours</span>
                            </div>
                            <span className="time-separator">:</span>
                            <div className="time-unit">
                                <span className="time-value">{formatTime(timeLeft.minutes)}</span>
                                <span className="time-label">Minutes</span>
                            </div>
                            <span className="time-separator">:</span>
                            <div className="time-unit">
                                <span className="time-value">{formatTime(timeLeft.seconds)}</span>
                                <span className="time-label">Seconds</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Stats */}
                <div className="deals-stats">
                    <Card padding="md" className="stat-card">
                        <FiTrendingUp className="stat-icon" />
                        <div>
                            <p className="stat-value">{deals.length}</p>
                            <p className="stat-label">Active Deals</p>
                        </div>
                    </Card>
                    <Card padding="md" className="stat-card">
                        <FiPercent className="stat-icon" />
                        <div>
                            <p className="stat-value">Up to {dealStats.maxDiscount}%</p>
                            <p className="stat-label">Discount</p>
                        </div>
                    </Card>
                    <Card padding="md" className="stat-card">
                        <span className="stat-icon">💰</span>
                        <div>
                            <p className="stat-value">${dealStats.totalSavings.toFixed(0)}</p>
                            <p className="stat-label">Total Savings</p>
                        </div>
                    </Card>
                    {dealStats.lowStockCount > 0 && (
                        <Card padding="md" className="stat-card urgency">
                            <FiZap className="stat-icon" />
                            <div>
                                <p className="stat-value">{dealStats.lowStockCount}</p>
                                <p className="stat-label">Almost Gone!</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="deals-loading">Loading amazing deals...</div>
                ) : (
                    <>
                        {/* Deals Grid */}
                        {deals.length > 0 ? (
                            <div className="deals-grid">
                                {deals.map((product, i) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                    >
                                        <Card hover padding="none" className="deal-card">
                                            {/* Discount Badge */}
                                            <div className="deal-badge">
                                                {calculateDiscount(product.price, product.comparePrice!)}% OFF
                                            </div>

                                            {/* Low Stock Warning */}
                                            {product.stockQty > 0 && product.stockQty <= 5 && (
                                                <div className="low-stock-badge">
                                                    <FiZap /> Only {product.stockQty} left!
                                                </div>
                                            )}

                                            <div className="deal-image">
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />
                                            </div>

                                            <div className="deal-info">
                                                <h3>{product.name}</h3>
                                                <p className="deal-description">{product.description}</p>

                                                {/* Stock Progress Bar */}
                                                {product.stockQty > 0 && product.stockQty <= 10 && (
                                                    <div className="stock-indicator">
                                                        <div className="stock-bar">
                                                            <div 
                                                                className="stock-fill" 
                                                                style={{ width: `${Math.min(product.stockQty * 10, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="stock-text">
                                                            {product.stockQty <= 3 ? 'Almost gone!' : 'Selling fast'}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="deal-pricing">
                                                    <div className="price-row">
                                                        <span className="current-price">${product.price}</span>
                                                        <span className="original-price">${product.comparePrice}</span>
                                                    </div>
                                                    <span className="savings">
                                                        Save ${(product.comparePrice! - product.price).toFixed(2)}
                                                    </span>
                                                </div>

                                                <Button
                                                    fullWidth
                                                    size="sm"
                                                    leftIcon={<FiShoppingCart />}
                                                    onClick={() => handleAddToCart(product.id)}
                                                    disabled={product.stockQty === 0}
                                                >
                                                    {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-deals">
                                <div className="no-deals-icon">🎁</div>
                                <h3>No active deals right now</h3>
                                <p>Check back soon for amazing offers!</p>
                                <Button onClick={fetchDeals}>Refresh Deals</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
