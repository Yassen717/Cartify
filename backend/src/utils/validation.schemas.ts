import { z } from 'zod';

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// ============================================================================
// PRODUCT VALIDATION SCHEMAS
// ============================================================================

export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be positive'),
    comparePrice: z.number().positive().optional(),
    stockQty: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
    sku: z.string().min(1, 'SKU is required'),
    brand: z.string().optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        position: z.number().int().min(0).default(0),
        isPrimary: z.boolean().default(false),
    })).optional(),
    variants: z.array(z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        stockQty: z.number().int().min(0).default(0),
        attributes: z.record(z.any()).optional(),
    })).optional(),
    attributes: z.array(z.object({
        attributeName: z.string(),
        attributeValue: z.string(),
    })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    sortBy: z.enum(['price', 'createdAt', 'name']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// CART VALIDATION SCHEMAS
// ============================================================================

export const addToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// ============================================================================
// ORDER VALIDATION SCHEMAS
// ============================================================================

export const addressSchema = z.object({
    type: z.enum(['SHIPPING', 'BILLING', 'BOTH']),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    isDefault: z.boolean().default(false),
});

export const createOrderSchema = z.object({
    shippingAddressId: z.string().uuid('Invalid shipping address ID').optional(),
    billingAddressId: z.string().uuid('Invalid billing address ID').optional(),
    shippingAddress: addressSchema.optional(),
    billingAddress: addressSchema.optional(),
    paymentMethod: z.string().min(1, 'Payment method is required'),
}).refine(
    (data) => data.shippingAddressId || data.shippingAddress,
    { message: 'Either shippingAddressId or shippingAddress must be provided' }
).refine(
    (data) => data.billingAddressId || data.billingAddress,
    { message: 'Either billingAddressId or billingAddress must be provided' }
);

export const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const addOrderTrackingSchema = z.object({
    status: z.string().min(1, 'Status is required'),
    location: z.string().optional(),
    notes: z.string().optional(),
});

// ============================================================================
// REVIEW VALIDATION SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
    images: z.array(z.string().url()).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const voteReviewSchema = z.object({
    voteType: z.enum(['HELPFUL', 'UNHELPFUL']),
});

// ============================================================================
// WISHLIST VALIDATION SCHEMAS
// ============================================================================

export const addToWishlistSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddOrderTrackingInput = z.infer<typeof addOrderTrackingSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type VoteReviewInput = z.infer<typeof voteReviewSchema>;
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
