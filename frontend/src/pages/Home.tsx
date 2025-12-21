import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { FiHeart } from 'react-icons/fi';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import * as productsService from '../services/products.service';
import type { Product } from '../services/products.service';
import toast from 'react-hot-toast';
import './Home.css';

export const Home = () => {
    const { addItem: addToWishlist, wishlist, fetchWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    // Fetch featured products from API
    const { data: productsData, isLoading, error } = useQuery({
        queryKey: ['featured-products'],
        queryFn: async () => {
            const response = await productsService.getProducts({
                page: 1,
                limit: 6,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
            return response.data.products;
        },
    });

    // Fetch wishlist on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated, fetchWishlist]);

    // Helper function to get product image
    const getProductImage = (product: Product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url;
        }
        // Fallback to placeholder
        return `https://via.placeholder.com/500?text=${encodeURIComponent(product.name)}`;
    };

    // Check if product is in wishlist
    const isInWishlist = (productId: string) => {
        return wishlist?.items?.some(item => item.productId === productId) || false;
    };

    // Handle wishlist button click
    const handleWishlistClick = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error('Please login to add items to wishlist');
            return;
        }
        
        try {
            await addToWishlist(productId);
        } catch (error) {
            // Error handled in store
        }
    };

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
                            <Link to="/products" style={{ textDecoration: 'none' }}>
  <Button variant="primary" size="lg">Explore Collection</Button>
</Link>
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
                        <Link to="/products" className="view-all-link">View All Products →</Link>
                    </div>

                    {isLoading && (
                        <div className="products-loading">
                            <p>Loading products...</p>
                        </div>
                    )}

                    {error && (
                        <div className="products-error">
                            <p>Failed to load products. Please try again later.</p>
                        </div>
                    )}

                    {!isLoading && !error && productsData && productsData.length === 0 && (
                        <div className="products-empty">
                            <p>No products available at the moment.</p>
                        </div>
                    )}

                    {!isLoading && !error && productsData && productsData.length > 0 && (
                        <div className="products-grid">
                            {productsData.map((product, i) => {
                                const productInWishlist = isInWishlist(product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        className="product-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Link to={`/products/${product.id}`} className="product-card-link">
                                            <div className="product-image">
                                                <img src={getProductImage(product)} alt={product.name} />
                                                <button 
                                                    className={`wishlist-btn ${productInWishlist ? 'active' : ''}`}
                                                    onClick={(e) => handleWishlistClick(e, product.id)}
                                                >
                                                    <FiHeart className={productInWishlist ? 'filled' : ''} />
                                                </button>
                                            </div>
                                            <div className="product-info">
                                                <p className="product-category">{product.category?.name || 'Uncategorized'}</p>
                                                <h3 className="product-name">{product.name}</h3>
                                                <div className="product-pricing">
                                                    <p className="product-price">${product.price}</p>
                                                    {product.comparePrice && product.comparePrice > product.price && (
                                                        <p className="product-compare-price">${product.comparePrice}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
