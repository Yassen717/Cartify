import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Create a product review
 * POST /api/products/:productId/reviews
 */
export const createReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { productId } = req.params;
        const { rating, title, comment, images } = req.body;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: req.user.id,
            },
        });

        if (existingReview) {
            throw new BadRequestError('You have already reviewed this product');
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                productId,
                userId: req.user.id,
                rating,
                title,
                comment,
                images: images
                    ? {
                        create: images.map((url: string) => ({ url })),
                    }
                    : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                images: true,
            },
        });

        logger.info(`Review created for product ${productId} by user ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: { review },
        });
    }
);

/**
 * Update a review
 * PUT /api/reviews/:id
 */
export const updateReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { id } = req.params;
        const { rating, title, comment } = req.body;

        // Get existing review
        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            throw new NotFoundError('Review not found');
        }

        // Verify ownership
        if (existingReview.userId !== req.user.id) {
            throw new UnauthorizedError('You can only update your own reviews');
        }

        // Update review
        const review = await prisma.review.update({
            where: { id },
            data: {
                ...(rating !== undefined && { rating }),
                ...(title && { title }),
                ...(comment && { comment }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                images: true,
            },
        });

        logger.info(`Review ${id} updated by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: { review },
        });
    }
);

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { id } = req.params;

        // Get existing review
        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            throw new NotFoundError('Review not found');
        }

        // Verify ownership (or admin)
        if (existingReview.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new UnauthorizedError('You can only delete your own reviews');
        }

        // Delete review
        await prisma.review.delete({
            where: { id },
        });

        logger.info(`Review ${id} deleted by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    }
);

/**
 * Vote on a review (helpful/unhelpful)
 * POST /api/reviews/:id/vote
 */
export const voteReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { id } = req.params;
        const { voteType } = req.body;

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundError('Review not found');
        }

        // Check if user already voted
        const existingVote = await prisma.reviewVote.findUnique({
            where: {
                reviewId_userId: {
                    reviewId: id,
                    userId: req.user.id,
                },
            },
        });

        if (existingVote) {
            // Update existing vote
            await prisma.reviewVote.update({
                where: {
                    reviewId_userId: {
                        reviewId: id,
                        userId: req.user.id,
                    },
                },
                data: { voteType },
            });
        } else {
            // Create new vote
            await prisma.reviewVote.create({
                data: {
                    reviewId: id,
                    userId: req.user.id,
                    voteType,
                },
            });
        }

        // Update review counts
        const helpfulCount = await prisma.reviewVote.count({
            where: {
                reviewId: id,
                voteType: 'HELPFUL',
            },
        });

        const unhelpfulCount = await prisma.reviewVote.count({
            where: {
                reviewId: id,
                voteType: 'UNHELPFUL',
            },
        });

        // Update review
        await prisma.review.update({
            where: { id },
            data: {
                helpfulCount,
                unhelpfulCount,
            },
        });

        logger.info(`User ${req.user.email} voted ${voteType} on review ${id}`);

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                helpfulCount,
                unhelpfulCount,
            },
        });
    }
);
