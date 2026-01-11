import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { getProducts, deleteProduct } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import { getProductImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';
import './ProductsManagement.css';

const ProductsManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await getProducts({ page, search, limit: 10 });
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div className="products-management">
            <div className="products-header">
                <h1>Products</h1>
                <Link to="/admin/products/new" className="add-product-btn">
                    <FiPlus />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="search-container">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="products-loading">Loading...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="products-empty">No products found</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                            <div className="product-info">
                                                <span className="product-name">{product.name}</span>
                                                <span className="product-sku">SKU: {product.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${Number(product.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`stock-badge ${product.stockQty <= 5 ? 'low' : 'good'}`}>
                                            {product.stockQty} in stock
                                        </span>
                                    </td>
                                    <td>
                                        {((product as any).category?.name) || 'Uncategorized'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link
                                                to={`/admin/products/${product.id}/edit`}
                                                className="action-btn edit"
                                            >
                                                <FiEdit2 />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="action-btn delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                >
                    Previous
                </button>
                <span className="pagination-info">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ProductsManagement;
