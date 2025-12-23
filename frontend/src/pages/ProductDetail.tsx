import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import { Button, Card, ProductDetailSkeleton } from '../components/ui';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import * as productsService from '../services/products.service';
import type { Product } from '../services/products.service';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const { addItem: addToCart } = useCartStore();
    const { addItem: addToWishlist, wishlist, fetchWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Fetch wishlist on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated, fetchWishlist]);

    const fetchProduct = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const response = await productsService.getProductById(id);
            setProduct(response.data.product);
        } catch (error) {
            toast.error('Failed to load product');
            navigate('/products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        if (!product) return;

        try {
            await addToCart(product.id, quantity);
        } catch (error) {
            // Error handled in store
        }
    };

    const handleAddToWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to wishlist');
            navigate('/login');
            return;
        }
        if (!product) return;

        try {
            await addToWishlist(product.id);
        } catch (error) {
            // Error handled in store
        }
    };

    // Check if product is in wishlist
    const isInWishlist = product ? (wishlist?.items?.some(item => item.productId === product.id) || false) : false;

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return null;
    }

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const images = product.images && product.images.length > 0
        ? product.images
        : [{ id: '1', url: 'https://via.placeholder.com/600', altText: product.name, isPrimary: true }];

    return (
        <div className="product-detail-page">
            <div className="container">
                <motion.div
                    className="product-detail"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={images[selectedImage]?.url} alt={product.name} />
                            {discount > 0 && (
                                <div className="discount-badge">{discount}% OFF</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="thumbnail-list">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image.url} alt={image.altText || product.name} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-header">
                            <div>
                                <p className="product-category">{product.category?.name || 'Uncategorized'}</p>
                                <h1>{product.name}</h1>
                                <div className="product-rating">
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar
                                                key={i}
                                                className={i < Math.floor(product.averageRating || 0) ? 'filled' : ''}
                                            />
                                        ))}
                                    </div>
                                    <span className="rating-text">
                                        {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="product-pricing">
                            <div className="price-row">
                                <span className="current-price">${product.price}</span>
                                {product.comparePrice && (
                                    <span className="compare-price">${product.comparePrice}</span>
                                )}
                            </div>
                            {discount > 0 && (
                                <span className="savings">You save ${(product.comparePrice! - product.price).toFixed(2)}</span>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Stock Status */}
                        <div className="stock-status">
                            {product.stockQty > 0 ? (
                                <span className="in-stock">✓ In Stock ({product.stockQty} available)</span>
                            ) : (
                                <span className="out-of-stock">✗ Out of Stock</span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.stockQty > 0 && (
                            <div className="quantity-section">
                                <label>Quantity:</label>
                                <div className="quantity-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <Button
                                size="lg"
                                fullWidth
                                leftIcon={<FiShoppingCart />}
                                onClick={handleAddToCart}
                                disabled={product.stockQty === 0}
                            >
                                {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                            <button
                                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                                onClick={handleAddToWishlist}
                            >
                                <FiHeart className={isInWishlist ? 'filled' : ''} />
                            </button>
                        </div>

                        {/* Features */}
                        <Card variant="glass" padding="lg" className="features-card">
                            <div className="feature-item">
                                <FiTruck className="feature-icon" />
                                <div>
                                    <h4>Free Shipping</h4>
                                    <p>On orders over $50</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <FiShield className="feature-icon" />
                                <div>
                                    <h4>Secure Payment</h4>
                                    <p>100% secure transactions</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <FiRotateCcw className="feature-icon" />
                                <div>
                                    <h4>Easy Returns</h4>
                                    <p>30-day return policy</p>
                                </div>
                            </div>
                        </Card>

                        {/* Product Details */}
                        {(product.brand || product.sku) && (
                            <Card padding="lg" className="details-card">
                                <h3>Product Details</h3>
                                <div className="details-list">
                                    {product.brand && (
                                        <div className="detail-row">
                                            <span className="detail-label">Brand:</span>
                                            <span className="detail-value">{product.brand}</span>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="detail-row">
                                            <span className="detail-label">SKU:</span>
                                            <span className="detail-value">{product.sku}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-label">Category:</span>
                                        <span className="detail-value">{product.category?.name || 'Uncategorized'}</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
