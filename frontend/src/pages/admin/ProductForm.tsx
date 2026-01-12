import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProductById } from '../../services/products.service';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProductForm.css';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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
            if (isEditMode) {
                await api.put(`/products/${id}`, data);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', data);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save product');
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
