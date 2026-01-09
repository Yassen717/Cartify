export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number;
    stockQty: number;
    sku: string;
    brand?: string;
    categoryId: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    images?: {
        id: string;
        url: string;
        altText: string;
        isPrimary: boolean;
    }[];
    averageRating?: number;
    reviewCount?: number;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: string;
    createdAt: string;
}
