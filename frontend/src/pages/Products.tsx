import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiFilter, FiGrid, FiList, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import './Products.css';

export const Products = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Mock data - will be replaced with API call
    const products = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Premium Product ${i + 1}`,
        description: 'High-quality item with amazing features and great value',
        price: 99.99 + i * 10,
        comparePrice: 149.99 + i * 10,
        image: `https://images.unsplash.com/photo-${1523275335684 + i}-eca6aff25d35?w=500&h=500&fit=crop`,
        category: ['Electronics', 'Fashion', 'Home'][i % 3],
        rating: 4 + (i % 2) * 0.5,
        reviews: 120 + i * 10,
    }));

    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];
    const [selectedCategory, setSelectedCategory] = useState('All');

    return (
        <div className="products-page">
            <div className="container">
                {/* Header */}
                <div className="products-header">
                    <div>
                        <h1>All Products</h1>
                        <p className="text-secondary">Discover our amazing collection</p>
                    </div>
                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <FiGrid />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FiList />
                        </button>
                    </div>
                </div>

                <div className="products-content">
                    {/* Filters Sidebar */}
                    <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                        <Card padding="lg">
                            <div className="filters-header">
                                <h3>Filters</h3>
                                <button className="clear-filters">Clear All</button>
                            </div>

                            {/* Categories */}
                            <div className="filter-group">
                                <h4>Categories</h4>
                                <div className="category-list">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="filter-group">
                                <h4>Price Range</h4>
                                <div className="price-inputs">
                                    <input type="number" placeholder="Min" className="price-input" />
                                    <span>to</span>
                                    <input type="number" placeholder="Max" className="price-input" />
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="filter-group">
                                <h4>Rating</h4>
                                <div className="rating-filters">
                                    {[4, 3, 2, 1].map((rating) => (
                                        <label key={rating} className="rating-option">
                                            <input type="checkbox" />
                                            <span>{rating}+ Stars</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Products Grid/List */}
                    <div className="products-main">
                        {/* Mobile Filter Toggle */}
                        <button
                            className="mobile-filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter /> Filters
                        </button>

                        {/* Products Count */}
                        <div className="products-meta">
                            <p>{products.length} Products Found</p>
                            <select className="sort-select">
                                <option>Sort by: Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest First</option>
                                <option>Best Rating</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        <div className={`products-display ${viewMode}`}>
                            {products.map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    className="product-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card hover padding="none">
                                        <div className="product-image-container">
                                            <img src={product.image} alt={product.name} />
                                            <button className="wishlist-btn">
                                                <FiHeart />
                                            </button>
                                            {product.comparePrice > product.price && (
                                                <div className="discount-badge">
                                                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-details">
                                            <span className="product-category">{product.category}</span>
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-description">{product.description}</p>
                                            <div className="product-rating">
                                                <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
                                                <span className="rating-count">({product.reviews})</span>
                                            </div>
                                            <div className="product-footer">
                                                <div className="product-pricing">
                                                    <span className="current-price">${product.price}</span>
                                                    {product.comparePrice && (
                                                        <span className="compare-price">${product.comparePrice}</span>
                                                    )}
                                                </div>
                                                <Button size="sm" leftIcon={<FiShoppingCart />}>
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <Button variant="outline">Previous</Button>
                            <div className="page-numbers">
                                <button className="page-number active">1</button>
                                <button className="page-number">2</button>
                                <button className="page-number">3</button>
                                <span>...</span>
                                <button className="page-number">10</button>
                            </div>
                            <Button variant="outline">Next</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
