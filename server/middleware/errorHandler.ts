import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log all errors with context
  logger.error('Request error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.userId,
    ip: req.ip,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Handle database errors (Drizzle/Postgres)
  if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_ENTRY',
      message: 'A record with this information already exists',
    });
  }

  if (err.message?.includes('foreign key constraint')) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_REFERENCE',
      message: 'Referenced record does not exist',
    });
  }

  if (err.message?.includes('violates not-null constraint')) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: 'A required field is missing',
    });
  }

  // Handle multer file upload errors
  if (err.message?.includes('File too large') || err.message?.includes('LIMIT_FILE_SIZE')) {
    return res.status(413).json({
      success: false,
      code: 'FILE_TOO_LARGE',
      message: 'Uploaded file is too large',
    });
  }

  // Default to 500 for unknown errors
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: isProduction 
      ? 'An internal error occurred' 
      : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch promise rejections
 * Use this to wrap async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * Should be registered after all routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`,
  });
};

