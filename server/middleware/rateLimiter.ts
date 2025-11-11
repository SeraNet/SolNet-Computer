import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for auth endpoint', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later',
      retryAfter: Math.ceil(15 * 60), // seconds
    });
  },
});

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for API endpoint', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(15 * 60), // seconds
    });
  },
});

// Relaxed limit for authenticated endpoints
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip rate limiting for admin users
    return req.user?.role === 'admin';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for authenticated endpoint', {
      ip: req.ip,
      path: req.path,
      userId: (req as any).user?.userId,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please slow down',
      retryAfter: Math.ceil(15 * 60), // seconds
    });
  },
});

