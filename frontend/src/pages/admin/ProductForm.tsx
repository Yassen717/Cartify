import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProductById } from '../../services/products.service';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProductForm.css';

interface Category {
    id: string;
    name: string;
}

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data.data.categories);
            } catch (error) {
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();

        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const response = await getProductById(id);
                    const product = response.data.product;
                    setValue('name', product.name);
                    setValue('description', product.description);
                    setValue('price', product.price);
                    setValue('stockQty', product.stockQty);
                    setValue('sku', product.sku);
                    setValue('categoryId', product.categoryId);
                } catch (error) {
                    toast.error('Failed to load product');
                    navigate('/admin/products');
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode, setValue, navigate]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const payload = {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                stockQty: parseInt(data.stockQty) || 0,
                sku: data.sku,
                categoryId: data.categoryId,
                slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            };
            
            console.log('Submitting payload:', payload);
            
            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error('Product creation error:', error.response?.data);
            const errorMsg = error.response?.data?.errors 
                ? error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
                : error.response?.data?.message || 'Failed to save product';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="product-form-container">
            <div className="product-form-header">
                <h1 className="product-form-title">
                    {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="product-form-subtitle">
                    {isEditMode ? 'Update product information' : 'Create a new product for your store'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="product-form">
                {/* Name */}
                <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className="form-input"
                        placeholder="Enter product name"
                    />
                    {errors.name && <p className="form-error">{errors.name.message as string}</p>}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={4}
                        className="form-textarea"
                        placeholder="Describe your product..."
                    />
                    {errors.description && <p className="form-error">{errors.description.message as string}</p>}
                </div>

                <div className="form-row">
                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">Price ($)</label>
                        <input
                            {...register('price', { required: 'Price is required', min: 0 })}
                            type="number"
                            step="0.01"
                            className="form-input"
                            placeholder="0.00"
                        />
                        {errors.price && <p className="form-error">{errors.price.message as string}</p>}
                    </div>

                    {/* Stock */}
                    <div className="form-group">
                        <label className="form-label">Stock Quantity</label>
                        <input
                            {...register('stockQty', { required: 'Stock is required', min: 0 })}
                            type="number"
                            className="form-input"
                            placeholder="0"
                        />
                        {errors.stockQty && <p className="form-error">{errors.stockQty.message as string}</p>}
                    </div>
                </div>

                <div className="form-row">
                    {/* SKU */}
                    <div className="form-group">
                        <label className="form-label">SKU</label>
                        <input
                            {...register('sku', { required: 'SKU is required' })}
                            type="text"
                            className="form-input"
                            placeholder="PROD-001"
                        />
                        {errors.sku && <p className="form-error">{errors.sku.message as string}</p>}
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            {...register('categoryId', { required: 'Category is required' })}
                            className="form-input"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="form-error">{errors.categoryId.message as string}</p>}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                    >
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
