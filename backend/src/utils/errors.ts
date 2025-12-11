// Custom error class for API errors
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;

    constructor(statusCode: number, message: string, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Common error creators
export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', details?: any) {
        super(400, message, true, details);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}

export class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}

export class ValidationError extends ApiError {
    constructor(message = 'Validation failed') {
        super(422, message);
    }
}

export class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error') {
        super(500, message, false);
    }
}
