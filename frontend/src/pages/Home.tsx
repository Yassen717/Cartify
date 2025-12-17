import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import './Home.css';

export const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=800&fit=crop"
                        alt="Hero"
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="hero-label">AUTUMN COLLECTION 2024</p>
                        <h1 className="hero-title">
                            Crafted for<br />
                            <em>Everyday Living</em>
                        </h1>
                        <p className="hero-subtitle">
                            Discover handpicked pieces that transform your<br />
                            space into a sanctuary of warmth and elegance.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary">Explore Collection</button>
                            <button className="btn-secondary">View Lookbook</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header-center">
                        <p className="section-label">SHOP BY ROOM</p>
                        <h2 className="section-title">Explore Categories</h2>
                    </div>

                    <div className="categories-grid">
                        {[
                            { name: 'Living Room', count: '174 Products', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop' },
                            { name: 'Lighting', count: '68 Products', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop' },
                            { name: 'Textiles', count: '89 Products', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=600&fit=crop' }
                        ].map((category, i) => (
                            <motion.div
                                key={category.name}
                                className="category-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="category-image">
                                    <img src={category.image} alt={category.name} />
                                    <div className="category-overlay"></div>
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p>{category.count}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header-split">
                        <div>
                            <p className="section-label">CURATED SELECTION</p>
                            <h2 className="section-title">Featured Products</h2>
                        </div>
                        <a href="/products" className="view-all-link">View All Products →</a>
                    </div>

                    <div className="products-grid">
                        {[
                            { name: 'Terracotta Artisan Vase', category: 'DECOR', price: 89, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500&h=500&fit=crop', isNew: true },
                            { name: 'Oak Round Side Table', category: 'LIVING', price: 320, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', isNew: true },
                            { name: 'Handwoven Linen Throw', category: 'TEXTILES', price: 78, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&h=500&fit=crop', isNew: false },
                            { name: 'Brass Cylinder Pendant', category: 'LIGHTING', price: 320, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop', isNew: false },
                            { name: 'Stacking Ceramic Bowls', category: 'KITCHEN', price: 95, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop', isNew: true },
                            { name: 'Natural Oak Frame', category: 'DECOR', price: 78, image: 'https://images.unsplash.com/photo-1582053433926-0b5e8b9e5d7f?w=500&h=500&fit=crop', isNew: false }
                        ].map((product, i) => (
                            <motion.div
                                key={i}
                                className="product-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    {product.isNew && <div className="product-badge">NEW</div>}
                                    <button className="wishlist-btn">
                                        <FiHeart />
                                    </button>
                                </div>
                                <div className="product-info">
                                    <p className="product-category">{product.category}</p>
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">${product.price}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
