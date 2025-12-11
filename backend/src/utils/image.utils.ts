import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

export interface ProcessedImage {
    original: string;
    thumbnail: string;
    medium: string;
}

export interface ImageProcessingOptions {
    generateThumbnail?: boolean;
    generateMedium?: boolean;
    thumbnailSize?: number;
    mediumSize?: number;
    quality?: number;
}

/**
 * Process and optimize an uploaded image
 * Generates multiple sizes (original, medium, thumbnail)
 */
export const processImage = async (
    filePath: string,
    options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
    const {
        generateThumbnail = true,
        generateMedium = true,
        thumbnailSize = 150,
        mediumSize = 500,
        quality = 80,
    } = options;

    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const dirname = path.dirname(filePath);

    const result: ProcessedImage = {
        original: filePath,
        thumbnail: '',
        medium: '',
    };

    try {
        // Get image metadata
        const metadata = await sharp(filePath).metadata();
        logger.info(`Processing image: ${basename}${ext} (${metadata.width}x${metadata.height})`);

        // Optimize original
        await sharp(filePath)
            .jpeg({ quality, mozjpeg: true })
            .png({ quality, compressionLevel: 9 })
            .webp({ quality })
            .toFile(filePath + '.tmp');

        // Replace original with optimized version
        fs.renameSync(filePath + '.tmp', filePath);

        // Generate medium size
        if (generateMedium && metadata.width && metadata.width > mediumSize) {
            const mediumPath = path.join(dirname, `${basename}-medium${ext}`);
            await sharp(filePath)
                .resize(mediumSize, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality })
                .png({ quality })
                .webp({ quality })
                .toFile(mediumPath);

            result.medium = mediumPath;
            logger.info(`Generated medium size: ${mediumPath}`);
        }

        // Generate thumbnail
        if (generateThumbnail) {
            const thumbnailPath = path.join(dirname, `${basename}-thumb${ext}`);
            await sharp(filePath)
                .resize(thumbnailSize, thumbnailSize, {
                    fit: 'cover',
                    position: 'center',
                })
                .jpeg({ quality })
                .png({ quality })
                .webp({ quality })
                .toFile(thumbnailPath);

            result.thumbnail = thumbnailPath;
            logger.info(`Generated thumbnail: ${thumbnailPath}`);
        }

        return result;
    } catch (error) {
        logger.error('Error processing image:', error);
        throw new Error(`Failed to process image: ${error}`);
    }
};

/**
 * Delete image and its variants
 */
export const deleteImage = async (filePath: string): Promise<void> => {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);
    const dirname = path.dirname(filePath);

    const files = [
        filePath,
        path.join(dirname, `${basename}-medium${ext}`),
        path.join(dirname, `${basename}-thumb${ext}`),
    ];

    for (const file of files) {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                logger.info(`Deleted image: ${file}`);
            }
        } catch (error) {
            logger.error(`Error deleting file ${file}:`, error);
        }
    }
};

/**
 * Get image URLs for different sizes
 */
export const getImageUrls = (filename: string): { original: string; medium: string; thumbnail: string } => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);

    return {
        original: `${baseUrl}/uploads/products/${filename}`,
        medium: `${baseUrl}/uploads/products/${basename}-medium${ext}`,
        thumbnail: `${baseUrl}/uploads/products/${basename}-thumb${ext}`,
    };
};

/**
 * Validate image file
 */
export const isValidImage = (file: Express.Multer.File): boolean => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return allowedMimes.includes(file.mimetype);
};
