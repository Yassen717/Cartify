import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { processImage, deleteImage, getImageUrls } from '../utils/image.utils';
import { logger } from '../utils/logger';
import fs from 'fs';

/**
 * Upload product image
 * POST /api/upload/product-image
 */
export const uploadProductImage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.file) {
            throw new BadRequestError('No file uploaded');
        }

        const file = req.file;
        logger.info(`Image uploaded: ${file.filename}`);

        // Process image (generate thumbnails and optimize)
        await processImage(file.path);

        // Get image URLs
        const urls = getImageUrls(file.filename);

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                urls,
            },
        });
    }
);

/**
 * Upload multiple product images
 * POST /api/upload/product-images
 */
export const uploadProductImages = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new BadRequestError('No files uploaded');
        }

        const files = req.files;
        logger.info(`${files.length} images uploaded`);

        // Process all images
        const processedImages = await Promise.all(
            files.map(async (file) => {
                await processImage(file.path);
                const urls = getImageUrls(file.filename);

                return {
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    urls,
                };
            })
        );

        res.status(201).json({
            success: true,
            message: `${files.length} images uploaded successfully`,
            data: {
                images: processedImages,
            },
        });
    }
);

/**
 * Delete uploaded image
 * DELETE /api/upload/:filename
 */
export const deleteUploadedImage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { filename } = req.params;

        if (!filename) {
            throw new BadRequestError('Filename is required');
        }

        const uploadsDir = path.join(__dirname, '../../uploads/products');
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new NotFoundError('Image not found');
        }

        // Delete image and its variants
        await deleteImage(filePath);

        logger.info(`Image deleted: ${filename}`);

        res.json({
            success: true,
            message: 'Image deleted successfully',
        });
    }
);
