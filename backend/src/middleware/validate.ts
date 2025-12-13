import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * Middleware factory for validating request data with Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('body', 'query', 'params')
 */
export const validate = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const validated = await schema.parseAsync(data);

            // For query params, we need to use Object.assign since req.query is read-only
            if (source === 'query') {
                Object.assign(req.query, validated);
            } else {
                req[source] = validated;
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                next(
                    new BadRequestError(
                        'Validation failed',
                        errorMessages
                    )
                );
            } else {
                next(error);
            }
        }
    };
};

/**
 * Middleware for validating request body
 */
export const validateBody = (schema: z.ZodSchema) => validate(schema, 'body');

/**
 * Middleware for validating query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => validate(schema, 'query');

/**
 * Middleware for validating route parameters
 */
export const validateParams = (schema: z.ZodSchema) => validate(schema, 'params');


