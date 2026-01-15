import { z } from 'zod';

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

// Strong password validation
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
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
    newPassword: passwordSchema,
});

// ============================================================================
// PRODUCT VALIDATION SCHEMAS
// ============================================================================

export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
    slug: z.string().min(1, 'Slug is required').max(200, 'Slug is too long'),
    description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
    price: z.number().positive('Price must be positive').max(1000000, 'Price is too high'),
    comparePrice: z.number().positive().max(1000000, 'Compare price is too high').optional(),
    stockQty: z.number().int().min(0, 'Stock quantity cannot be negative').max(100000, 'Stock quantity is too high').default(0),
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU is too long'),
    brand: z.string().max(100, 'Brand name is too long').optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.object({
        url: z.string().min(1, 'Image URL is required'),
        altText: z.string().optional(),
        position: z.number().int().min(0).default(0),
        isPrimary: z.boolean().default(false),
    })).optional(),
    variants: z.array(z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        stockQty: z.number().int().min(0).default(0),
        attributes: z.record(z.string(), z.any()).optional(),
    })).optional(),
    attributes: z.array(z.object({
        attributeName: z.string(),
        attributeValue: z.string(),
    })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.preprocess(
        (val) => (typeof val === 'string' && val.match(/^\d+$/) ? Number(val) : 1),
        z.number().int().positive().default(1)
    ),
    limit: z.preprocess(
        (val) => (typeof val === 'string' && val.match(/^\d+$/) ? Number(val) : 20),
        z.number().int().positive().default(20)
    ),
    search: z.preprocess(
        (val) => (typeof val === 'string' && val !== '' ? val : undefined),
        z.string().optional()
    ),
    categoryId: z.preprocess(
        (val) => (typeof val === 'string' && val !== '' ? val : undefined),
        z.string().uuid().optional()
    ),
    minPrice: z.preprocess(
        (val) => (typeof val === 'string' && val !== '' && val.match(/^\d+(\.\d+)?$/) ? Number(val) : undefined),
        z.number().positive().optional()
    ),
    maxPrice: z.preprocess(
        (val) => (typeof val === 'string' && val !== '' && val.match(/^\d+(\.\d+)?$/) ? Number(val) : undefined),
        z.number().positive().optional()
    ),
    sortBy: z.enum(['price', 'createdAt', 'name']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// CART VALIDATION SCHEMAS
// ============================================================================

export const addToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100').default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
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
