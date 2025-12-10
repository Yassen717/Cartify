import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPackage } from 'react-icons/fi';
import { Card } from '../components/ui';
import * as categoriesService from '../services/categories.service';
import type { Category } from '../services/categories.service';
import toast from 'react-hot-toast';
import './Categories.css';

export const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await categoriesService.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const categoryImages = {
        Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
        Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
        'Home & Garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&h=400&fit=crop',
        Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
        Books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
        Toys: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
    };

    return (
        <div className="categories-page">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="categories-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Browse Categories</h1>
                    <p className="categories-subtitle">
                        Explore our wide range of product categories
                    </p>
                </motion.div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="categories-loading">Loading categories...</div>
                ) : (
                    <>
                        {/* Categories Grid */}
                        <div className="categories-grid">
                            {categories.length > 0 ? (
                                categories.map((category, i) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                    >
                                        <Link to={`/products?category=${category.id}`}>
                                            <Card hover padding="none" className="category-card">
                                                <div className="category-image">
                                                    <img
                                                        src={category.image || categoryImages[category.name as keyof typeof categoryImages] || 'https://via.placeholder.com/600x400'}
                                                        alt={category.name}
                                                    />
                                                    <div className="category-overlay">
                                                        <FiArrowRight className="category-arrow" />
                                                    </div>
                                                </div>
                                                <div className="category-info">
                                                    <h3>{category.name}</h3>
                                                    {category.description && (
                                                        <p className="category-description">{category.description}</p>
                                                    )}
                                                    <div className="category-meta">
                                                        <FiPackage />
                                                        <span>{category.productCount || 0} Products</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="no-categories">
                                    <FiPackage className="no-categories-icon" />
                                    <h3>No categories available</h3>
                                    <p>Check back soon for new categories!</p>
                                </div>
                            )}
                        </div>

                        {/* Featured Section */}
                        {categories.length > 0 && (
                            <motion.div
                                className="featured-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <Card variant="gradient" padding="lg" className="featured-card">
                                    <h2>Can't find what you're looking for?</h2>
                                    <p>Browse all products or use our search feature</p>
                                    <div className="featured-actions">
                                        <Link to="/products">
                                            <motion.button
                                                className="featured-btn"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                View All Products <FiArrowRight />
                                            </motion.button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
