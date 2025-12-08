import { motion } from 'framer-motion';
import { Button } from '../components/ui';
import { FiArrowRight, FiTrendingUp, FiStar, FiShoppingBag } from 'react-icons/fi';
import './Home.css';

export const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background" />
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1
                            className="hero-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            Discover Premium Products
                            <span className="text-gradient"> at Amazing Prices</span>
                        </motion.h1>
                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Shop the latest trends with exclusive deals and fast shipping
                        </motion.p>
                        <motion.div
                            className="hero-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <Button size="lg" rightIcon={<FiArrowRight />}>
                                Shop Now
                            </Button>
                            <Button size="lg" variant="outline">
                                Browse Categories
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <motion.div
                            className="feature-card glass"
                            whileHover={{ y: -8 }}
                        >
                            <div className="feature-icon">
                                <FiShoppingBag />
                            </div>
                            <h3>Free Shipping</h3>
                            <p>On orders over $50</p>
                        </motion.div>

                        <motion.div
                            className="feature-card glass"
                            whileHover={{ y: -8 }}
                        >
                            <div className="feature-icon">
                                <FiStar />
                            </div>
                            <h3>Premium Quality</h3>
                            <p>Curated products</p>
                        </motion.div>

                        <motion.div
                            className="feature-card glass"
                            whileHover={{ y: -8 }}
                        >
                            <div className="feature-icon">
                                <FiTrendingUp />
                            </div>
                            <h3>Best Prices</h3>
                            <p>Unbeatable deals</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Featured Products</h2>
                        <Button variant="ghost">View All <FiArrowRight /></Button>
                    </div>

                    <div className="products-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <motion.div
                                key={i}
                                className="product-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="product-image">
                                    <img
                                        src={`https://images.unsplash.com/photo-${1523275335684 + i}-eca6aff25d35?w=500&h=500&fit=crop`}
                                        alt="Product"
                                    />
                                    <div className="product-badge">New</div>
                                </div>
                                <div className="product-info">
                                    <h3>Premium Product {i}</h3>
                                    <p className="product-description">High-quality item with amazing features</p>
                                    <div className="product-footer">
                                        <div className="product-price">
                                            <span className="price-current">$99.99</span>
                                            <span className="price-old">$149.99</span>
                                        </div>
                                        <Button size="sm">Add to Cart</Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <h2 className="text-center">Shop by Category</h2>
                    <div className="categories-grid">
                        {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((category, i) => (
                            <motion.div
                                key={category}
                                className="category-card gradient-primary"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <h3>{category}</h3>
                                <p>Explore now</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
