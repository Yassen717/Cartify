/**
 * Utility functions for handling product images
 */

// Available product images in public folder
const PRODUCT_IMAGES = [
    '/product-1.webp',
    '/product-2.webp',
    '/product-3.webp',
    '/product-4.webp',
    '/product-5.webp',
    '/product-6.webp',
];

/**
 * Get a local product image based on product ID or index
 * This ensures consistent image assignment for the same product
 */
export const getLocalProductImage = (productId: string, index: number = 0): string => {
    // Use product ID to consistently assign images
    // Convert product ID to number and use modulo to cycle through available images
    const idHash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = (idHash + index) % PRODUCT_IMAGES.length;
    return PRODUCT_IMAGES[imageIndex];
};

/**
 * Convert external image URL to local image if it's from internet
 * Otherwise, return the original URL (for images from backend/uploads)
 */
export const getProductImageUrl = (imageUrl: string | undefined, productId: string, index: number = 0): string => {
    // If no image URL provided, use local image
    if (!imageUrl) {
        return getLocalProductImage(productId, index);
    }

    // If it's already a local path (starts with /), return as is
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    // If it's from backend/uploads, return as is (it's a local backend path)
    if (imageUrl.includes('/uploads/') || imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
        return imageUrl;
    }

    // If it's an external URL (http/https), replace with local image
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return getLocalProductImage(productId, index);
    }

    // Default: return local image
    return getLocalProductImage(productId, index);
};

/**
 * Get product image for display
 * Handles both single image and image arrays
 */
export const getProductImage = (
    product: { id: string; images?: Array<{ url: string }> },
    imageIndex: number = 0
): string => {
    if (product.images && product.images.length > 0) {
        const image = product.images[imageIndex] || product.images[0];
        return getProductImageUrl(image.url, product.id, imageIndex);
    }
    // Fallback to local image
    return getLocalProductImage(product.id, imageIndex);
};

