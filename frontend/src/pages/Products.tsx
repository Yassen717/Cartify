import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Button, Card } from '../components/ui';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import * as productsService from '../services/products.service';
import type { Product } from '../services/products.service';
import toast from 'react-hot-toast';
import './Products.css';

export const Products = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt',
        sortOrder: 'desc' as 'asc' | 'desc',
    });
    const [searchInput, setSearchInput] = useState('');

    const { addItem } = useCartStore();
    const { addItem: addToWishlist, wishlist, fetchWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    // Fetch wishlist on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated, fetchWishlist]);

    // Sync URL -> local search filter
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';

        setSearchInput(urlSearch);
        setFilters((prev) => {
            if (prev.search === urlSearch) return prev;
            return { ...prev, search: urlSearch };
        });
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [pagination.page, filters]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await productsService.getProducts({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
            });
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to load products');
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

    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];

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
                                <button
                                    className="clear-filters"
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearchParams((prev) => {
                                            const next = new URLSearchParams(prev);
                                            next.delete('search');
                                            return next;
                                        });
                                        setFilters({
                                            search: '',
                                            categoryId: '',
                                            minPrice: '',
                                            maxPrice: '',
                                            sortBy: 'createdAt',
                                            sortOrder: 'desc',
                                        });
                                        setPagination({ ...pagination, page: 1 });
                                    }}
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Search */}
                            <div className="filter-group">
                                <h4>Search</h4>
                                <div className="price-inputs">
                                    <input
                                        type="search"
                                        placeholder="Search products"
                                        className="price-input"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const trimmed = searchInput.trim();

                                                setFilters((prev) => ({ ...prev, search: trimmed }));
                                                setPagination((prev) => ({ ...prev, page: 1 }));
                                                setSearchParams((prev) => {
                                                    const next = new URLSearchParams(prev);
                                                    if (trimmed) {
                                                        next.set('search', trimmed);
                                                    } else {
                                                        next.delete('search');
                                                    }
                                                    return next;
                                                });
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const trimmed = searchInput.trim();

                                            setFilters((prev) => ({ ...prev, search: trimmed }));
                                            setPagination((prev) => ({ ...prev, page: 1 }));
                                            setSearchParams((prev) => {
                                                const next = new URLSearchParams(prev);
                                                if (trimmed) {
                                                    next.set('search', trimmed);
                                                } else {
                                                    next.delete('search');
                                                }
                                                return next;
                                            });
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="filter-group">
                                <h4>Categories</h4>
                                <div className="category-list">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`category-item ${!filters.categoryId && cat === 'All' ? 'active' : ''}`}
                                            onClick={() => {
                                                setFilters({ ...filters, categoryId: cat === 'All' ? '' : cat });
                                                setPagination({ ...pagination, page: 1 });
                                            }}
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
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="price-input"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="price-input"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    />
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
                            <p>{pagination.total} Products Found</p>
                            <select
                                className="sort-select"
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                    setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                                }}
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="products-loading">Loading products...</div>
                        ) : (
                            <>
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
                                            <Link to={`/products/${product.id}`} className="product-link">
                                                <Card hover padding="none">
                                                    <div className="product-image-container">
                                                        <img
                                                            src={getProductImage(product)}
                                                            alt={product.name}
                                                        />
                                                        <button 
                                                            className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                                                            onClick={(e) => handleWishlistClick(e, product.id)}
                                                        >
                                                            <FiHeart className={isInWishlist(product.id) ? 'filled' : ''} />
                                                        </button>
                                                        {product.comparePrice && product.comparePrice > product.price && (
                                                            <div className="discount-badge">
                                                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="product-details">
                                                        <span className="product-category">{product.category?.name || 'Uncategorized'}</span>
                                                        <h3 className="product-name">{product.name}</h3>
                                                        <p className="product-description">{product.description}</p>
                                                        {product.averageRating && (
                                                            <div className="product-rating">
                                                                <span className="stars">{'⭐'.repeat(Math.floor(product.averageRating))}</span>
                                                                <span className="rating-count">({product.reviewCount || 0})</span>
                                                            </div>
                                                        )}
                                                        <div className="product-footer">
                                                            <div className="product-pricing">
                                                                <span className="current-price">${product.price}</span>
                                                                {product.comparePrice && (
                                                                    <span className="compare-price">${product.comparePrice}</span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                leftIcon={<FiShoppingCart />}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleAddToCart(product.id);
                                                                }}
                                                                disabled={product.stockQty === 0}
                                                            >
                                                                {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <Button
                                            variant="outline"
                                            disabled={pagination.page === 1}
                                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        >
                                            Previous
                                        </Button>
                                        <div className="page-numbers">
                                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    className={`page-number ${pagination.page === page ? 'active' : ''}`}
                                                    onClick={() => setPagination({ ...pagination, page })}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
