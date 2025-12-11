import api from './api';

export interface UploadResponse {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    urls: {
        original: string;
        medium: string;
        thumbnail: string;
    };
}

export interface MultipleUploadResponse {
    images: UploadResponse[];
}

/**
 * Upload a single product image
 */
export const uploadProductImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ success: boolean; data: UploadResponse }>(
        '/upload/product-image',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.data;
};

/**
 * Upload multiple product images
 */
export const uploadProductImages = async (files: File[]): Promise<MultipleUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    const response = await api.post<{ success: boolean; data: MultipleUploadResponse }>(
        '/upload/product-images',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.data;
};

/**
 * Delete an uploaded image
 */
export const deleteUploadedImage = async (filename: string): Promise<void> => {
    await api.delete(`/upload/${filename}`);
};
