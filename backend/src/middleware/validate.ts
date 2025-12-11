import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * Middleware factory for validating request data with Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('body', 'query', 'params')
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const validated = await schema.parseAsync(data);
            req[source] = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
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
export const validateBody = (schema: AnyZodObject) => validate(schema, 'body');

/**
 * Middleware for validating query parameters
 */
export const validateQuery = (schema: AnyZodObject) => validate(schema, 'query');

/**
 * Middleware for validating route parameters
 */
export const validateParams = (schema: AnyZodObject) => validate(schema, 'params');
