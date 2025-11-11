# AI Agent Fix Plan - SolNetManage4 System Issues

> **Purpose**: This document provides a systematic, step-by-step plan for AI agents to fix functionality issues in the SolNetManage4 system.
> 
> **Execution Mode**: Sequential with dependency tracking
> 
> **Estimated Time**: 4-6 hours of AI agent work across multiple sessions

---

## Table of Contents

1. [Critical Issues (Session 1)](#session-1-critical-security-fixes)
2. [High Priority Issues (Session 2)](#session-2-high-priority-fixes)
3. [Medium Priority Issues (Session 3)](#session-3-medium-priority-fixes)
4. [Low Priority Issues (Session 4)](#session-4-low-priority-cleanup)
5. [Testing & Validation](#testing-validation)
6. [Rollback Procedures](#rollback-procedures)

---

## Session 1: Critical Security Fixes

**Estimated Time**: 60-90 minutes  
**Risk Level**: High  
**Requires Testing**: Yes  
**Dependencies**: None

### 🔴 Task 1.1: Fix JWT Secret Handling

**Priority**: CRITICAL  
**Files**: `server/routes.ts`

**Current Issue**:
```typescript
// Line 65-68
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

**Action Required**:
1. Verify the check is at the top of `registerRoutes` function
2. Ensure no fallback value exists
3. Add startup validation

**Fix Implementation**:
```typescript
// At the very start of server/index.ts (before routes registration)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me') {
  console.error('❌ CRITICAL: JWT_SECRET environment variable must be set to a secure value');
  process.exit(1);
}

// In server/routes.ts - keep existing check
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

**Verification**:
- [ ] Server fails to start without JWT_SECRET
- [ ] No default/fallback values exist
- [ ] Error message is clear

---

### 🔴 Task 1.2: Fix Silent Error Catching

**Priority**: CRITICAL  
**Files**: `server/storage.ts`, `server/routes.ts`

**Current Issue**:
```typescript
// Line 909 in server/storage.ts
} catch (error) {}  // Silent error - no logging or handling
```

**Action Required**:
1. Find all empty catch blocks: `grep -n "catch.*{[\s]*}" server/`
2. Replace with proper error handling
3. Use logger utility for consistency

**Fix Pattern**:
```typescript
// BEFORE
try {
  await someOperation();
} catch (error) {}

// AFTER
try {
  await someOperation();
} catch (error) {
  logger.error('Failed to perform operation', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context: 'functionName'
  });
  // Decide: rethrow, return default value, or continue
  // throw error; // or
  // return null; // or
  // continue with degraded functionality
}
```

**Files to Fix**:
1. `server/storage.ts` - Line 909 (SMS sending)
2. Search for pattern: `} catch.*{[\s]*}`

**Verification**:
- [ ] No empty catch blocks remain
- [ ] All errors are logged
- [ ] Critical errors are re-thrown

---

### 🔴 Task 1.3: Add Rate Limiting

**Priority**: CRITICAL  
**Files**: `server/routes.ts`, `package.json`

**Current Issue**: No rate limiting on authentication endpoints

**Action Required**:
1. Install `express-rate-limit` package
2. Add rate limiting middleware
3. Apply to sensitive endpoints

**Fix Implementation**:

**Step 1**: Add dependency
```bash
npm install express-rate-limit
```

**Step 2**: Create rate limit configuration
```typescript
// server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Strict rate limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed limit for authenticated endpoints
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please slow down',
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user?.role === 'admin';
  },
});
```

**Step 3**: Apply to routes in `server/routes.ts`
```typescript
import { authLimiter, apiLimiter, authenticatedLimiter } from './middleware/rateLimiter';

// Apply to login endpoint
app.post("/api/login", authLimiter, async (req, res) => {
  // existing code
});

// Apply to registration if exists
app.post("/api/register", authLimiter, async (req, res) => {
  // existing code
});

// Apply to password reset
app.post("/api/reset-password", authLimiter, async (req, res) => {
  // existing code
});
```

**Verification**:
- [ ] Login fails after 5 attempts in 15 minutes
- [ ] Rate limit headers are returned
- [ ] Admin users can bypass certain limits
- [ ] Rate limits reset after window expires

---

### 🔴 Task 1.4: Fix CORS Configuration

**Priority**: CRITICAL  
**Files**: `server/index.ts`

**Current Issue**: Hardcoded CORS origin for development

**Action Required**:
1. Make CORS configuration environment-based
2. Support multiple origins
3. Secure credentials handling

**Fix Implementation**:

**Step 1**: Update `.env` file template
```bash
# In env.template and env.production.template
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
NODE_ENV=development
```

**Step 2**: Fix CORS in `server/index.ts`
```typescript
// BEFORE (around line 12-25)
res.header("Access-Control-Allow-Origin", "http://localhost:5173");

// AFTER
import cors from 'cors';

const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-selected-location'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Remove manual CORS headers if they exist
```

**Verification**:
- [ ] Development origin works
- [ ] Production origin works (when deployed)
- [ ] Unauthorized origins are blocked
- [ ] Credentials are properly handled

---

### 🔴 Task 1.5: Enhance File Upload Security

**Priority**: CRITICAL  
**Files**: `server/routes.ts`

**Current Issue**: Basic file validation, no virus scanning

**Action Required**:
1. Enhance file type validation
2. Add file name sanitization
3. Add content verification
4. Document limitations

**Fix Implementation**:

```typescript
// In server/routes.ts, update validateFileUpload middleware (around line 74)

const validateFileUpload = (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // 1. Whitelist allowed MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      message: "Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed",
      receivedType: req.file.mimetype,
    });
  }

  // 2. Validate file extension matches MIME type
  const ext = path.extname(req.file.originalname).toLowerCase();
  const validExtensions = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/jpg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
  };
  
  if (!validExtensions[req.file.mimetype]?.includes(ext)) {
    return res.status(400).json({
      message: "File extension does not match content type",
      extension: ext,
      mimeType: req.file.mimetype,
    });
  }

  // 3. Sanitize filename
  const sanitizedName = req.file.originalname
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
  req.file.originalname = sanitizedName;

  // 4. Check file size (already exists, but verify)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      message: "File too large. Maximum size is 10MB",
      receivedSize: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
    });
  }

  // 5. Basic content validation for images
  if (req.file.mimetype.startsWith('image/')) {
    // Verify image header bytes
    const imageSignatures: { [key: string]: number[] } = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'application/pdf': [0x25, 0x50, 0x44, 0x46],
    };
    
    const signature = imageSignatures[req.file.mimetype];
    if (signature) {
      const headerBytes = Array.from(req.file.buffer.slice(0, signature.length));
      const matches = signature.every((byte, i) => headerBytes[i] === byte);
      
      if (!matches) {
        logger.warn('File header mismatch', { 
          expectedType: req.file.mimetype,
          filename: req.file.originalname 
        });
        return res.status(400).json({
          message: "File content does not match declared type",
        });
      }
    }
  }

  // 6. Log upload for security audit
  logger.info('File upload validated', {
    filename: sanitizedName,
    mimetype: req.file.mimetype,
    size: req.file.size,
    userId: req.user?.userId,
  });

  next();
};
```

**Additional: Add upload cleanup on error**:
```typescript
// Add middleware after file operations to clean up on error
app.use((err: any, req: any, res: any, next: any) => {
  // If there was an uploaded file and an error occurred, log it
  if (req.file) {
    logger.error('Upload failed, file was rejected', {
      filename: req.file.originalname,
      error: err.message,
    });
  }
  next(err);
});
```

**Verification**:
- [ ] Only whitelisted file types accepted
- [ ] File extension matches MIME type
- [ ] Filenames are sanitized
- [ ] File headers are validated
- [ ] Upload attempts are logged

---

## Session 2: High Priority Fixes

**Estimated Time**: 90-120 minutes  
**Risk Level**: Medium  
**Requires Testing**: Yes  
**Dependencies**: Session 1 complete

### 🟡 Task 2.1: Implement Comprehensive Error Handling

**Priority**: HIGH  
**Files**: Multiple across `server/routes.ts`, `client/src/`

**Current Issue**: Inconsistent error handling, generic error messages

**Action Required**:
1. Create centralized error handling
2. Create error types/classes
3. Update all API routes
4. Update client error handling

**Fix Implementation**:

**Step 1**: Create error handling utilities

```typescript
// server/utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(500, message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(503, `${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}
```

**Step 2**: Create error handler middleware

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log all errors
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.userId,
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

// Async handler wrapper to catch promise rejections
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

**Step 3**: Apply to express app

```typescript
// In server/index.ts or server/routes.ts
import { errorHandler } from './middleware/errorHandler';
import { asyncHandler } from './middleware/errorHandler';

// ... after all routes are registered ...

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);
```

**Step 4**: Update sample route to use new error handling

```typescript
// Example: Update a route in server/routes.ts
app.get("/api/customers/:id", authenticateAndFilter, asyncHandler(async (req: any, res) => {
  const customer = await storage.getCustomer(req.params.id);
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Check authorization
  if (customer.locationId !== req.user.locationId && req.user.role !== 'admin') {
    throw new AuthorizationError('You do not have access to this customer');
  }
  
  res.json(customer);
}));
```

**Verification**:
- [ ] All routes use asyncHandler
- [ ] Errors include proper status codes
- [ ] Zod errors are formatted consistently
- [ ] Production doesn't expose stack traces
- [ ] All errors are logged

---

### 🟡 Task 2.2: Fix SMS Service Error Handling

**Priority**: HIGH  
**Files**: `server/storage.ts`, `server/sms-service.ts`, `server/ethiopian-sms-service.ts`

**Current Issue**: SMS failures are silent (empty catch blocks)

**Action Required**:
1. Add proper error logging for SMS failures
2. Implement retry mechanism
3. Store failed SMS for manual review
4. Add SMS queue for reliability

**Fix Implementation**:

**Step 1**: Create SMS error tracking table (migration)

```typescript
// Create new file: migrations/XXXX_add_sms_queue.sql
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'device_registration', 'status_update', etc.
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

CREATE INDEX idx_sms_queue_status ON sms_queue(status);
CREATE INDEX idx_sms_queue_created_at ON sms_queue(created_at);
```

**Step 2**: Update schema

```typescript
// In shared/schema.ts, add sms_queue table schema
export const smsQueue = pgTable("sms_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  lastAttemptAt: timestamp("last_attempt_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
});
```

**Step 3**: Fix SMS error handling in storage.ts

```typescript
// In server/storage.ts, replace line 856-910 area

async sendDeviceRegistrationSMS(device: any): Promise<void> {
  try {
    const details = await this.getDeviceWithDetails(device.id);
    
    if (!details || !details.customerPhone) {
      logger.warn('Cannot send SMS: missing device details or customer phone', {
        deviceId: device.id,
      });
      return;
    }

    // Queue the SMS instead of sending directly
    await this.queueSMS({
      phone: details.customerPhone,
      message: this.buildRegistrationSMSMessage(details),
      type: 'device_registration',
      metadata: {
        deviceId: device.id,
        receiptNumber: details.receiptNumber,
      },
    });

    logger.info('Device registration SMS queued', {
      deviceId: device.id,
      phone: details.customerPhone,
    });
  } catch (error) {
    logger.error('Failed to queue device registration SMS', {
      error: error instanceof Error ? error.message : 'Unknown error',
      deviceId: device.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Don't throw - SMS failure shouldn't break device registration
  }
}

private async queueSMS(smsData: {
  phone: string;
  message: string;
  type: string;
  metadata?: any;
}): Promise<void> {
  await db.insert(smsQueue).values({
    phone: smsData.phone,
    message: smsData.message,
    type: smsData.type,
    metadata: smsData.metadata || {},
    status: 'pending',
    attempts: 0,
  });
}

private buildRegistrationSMSMessage(details: any): string {
  return `Device registered! Receipt #${details.receiptNumber}. ` +
    `${details.deviceType} ${details.brand || ''} ${details.model || ''}. ` +
    `Est. completion: ${details.estimatedCompletionDate ? 
      new Date(details.estimatedCompletionDate).toLocaleDateString() : 
      'TBD'}. ` +
    `Total: ${details.totalCost ? `${details.totalCost} Birr` : 'TBD'}`;
}
```

**Step 4**: Create SMS processor service

```typescript
// Create new file: server/sms-processor.ts
import { db } from './db';
import { smsQueue } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import { logger } from './utils/logger';
import { sendSMS } from './sms-service';

export class SMSProcessor {
  private isProcessing = false;
  private intervalId?: NodeJS.Timeout;

  start(intervalMs: number = 30000) {
    logger.info('Starting SMS processor', { intervalMs });
    
    this.intervalId = setInterval(() => {
      this.processPendingSMS();
    }, intervalMs);

    // Process immediately on start
    this.processPendingSMS();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      logger.info('SMS processor stopped');
    }
  }

  private async processPendingSMS() {
    if (this.isProcessing) {
      logger.debug('SMS processor already running, skipping');
      return;
    }

    this.isProcessing = true;

    try {
      // Get pending SMS that haven't exceeded max attempts
      const pendingSMS = await db
        .select()
        .from(smsQueue)
        .where(
          and(
            eq(smsQueue.status, 'pending'),
            lt(smsQueue.attempts, smsQueue.maxAttempts)
          )
        )
        .limit(10); // Process 10 at a time

      logger.info(`Processing ${pendingSMS.length} pending SMS`);

      for (const sms of pendingSMS) {
        await this.processSingleSMS(sms);
      }
    } catch (error) {
      logger.error('Error in SMS processor', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSingleSMS(sms: any) {
    try {
      // Attempt to send
      await sendSMS(sms.phone, sms.message);

      // Mark as sent
      await db
        .update(smsQueue)
        .set({
          status: 'sent',
          sentAt: new Date(),
          lastAttemptAt: new Date(),
        })
        .where(eq(smsQueue.id, sms.id));

      logger.info('SMS sent successfully', {
        smsId: sms.id,
        phone: sms.phone,
        type: sms.type,
      });
    } catch (error) {
      const attempts = sms.attempts + 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update attempt count and error
      await db
        .update(smsQueue)
        .set({
          attempts,
          lastAttemptAt: new Date(),
          errorMessage,
          status: attempts >= sms.maxAttempts ? 'failed' : 'pending',
        })
        .where(eq(smsQueue.id, sms.id));

      logger.error('SMS send failed', {
        smsId: sms.id,
        phone: sms.phone,
        attempts,
        maxAttempts: sms.maxAttempts,
        error: errorMessage,
      });
    }
  }

  // Manual retry method for admin interface
  async retrySMS(smsId: string) {
    const [sms] = await db
      .select()
      .from(smsQueue)
      .where(eq(smsQueue.id, smsId));

    if (!sms) {
      throw new Error('SMS not found');
    }

    // Reset attempts and status
    await db
      .update(smsQueue)
      .set({
        attempts: 0,
        status: 'pending',
        errorMessage: null,
      })
      .where(eq(smsQueue.id, smsId));

    await this.processSingleSMS({ ...sms, attempts: 0 });
  }
}

export const smsProcessor = new SMSProcessor();
```

**Step 5**: Start SMS processor in server

```typescript
// In server/index.ts
import { smsProcessor } from './sms-processor';

// After server starts
const server = registerRoutes(app);

// Start SMS processor
smsProcessor.start(30000); // Process every 30 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  smsProcessor.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

**Step 6**: Add admin endpoint to view failed SMS

```typescript
// In server/routes.ts
app.get("/api/sms/queue", authenticateAndFilter, asyncHandler(async (req: any, res) => {
  if (req.user.role !== 'admin') {
    throw new AuthorizationError();
  }

  const status = req.query.status || 'failed';
  const queue = await db
    .select()
    .from(smsQueue)
    .where(eq(smsQueue.status, status))
    .orderBy(desc(smsQueue.createdAt))
    .limit(100);

  res.json(queue);
}));

app.post("/api/sms/retry/:id", authenticateAndFilter, asyncHandler(async (req: any, res) => {
  if (req.user.role !== 'admin') {
    throw new AuthorizationError();
  }

  await smsProcessor.retrySMS(req.params.id);
  res.json({ success: true, message: 'SMS retry initiated' });
}));
```

**Verification**:
- [ ] SMS failures are logged properly
- [ ] Failed SMS are queued for retry
- [ ] SMS processor runs in background
- [ ] Admin can view failed SMS
- [ ] Admin can manually retry SMS
- [ ] SMS doesn't block main operations

---

### 🟡 Task 2.3: Add Input Validation & Sanitization

**Priority**: HIGH  
**Files**: Multiple in `server/routes.ts`

**Current Issue**: Some endpoints missing validation

**Action Required**:
1. Audit all POST/PUT/PATCH endpoints
2. Ensure all use Zod schemas
3. Add sanitization for text fields
4. Add SQL injection prevention checks

**Fix Implementation**:

**Step 1**: Create sanitization utilities

```typescript
// server/utils/sanitize.ts
import validator from 'validator';

export const sanitize = {
  // Remove HTML tags and encode special characters
  text: (input: string): string => {
    return validator.escape(validator.stripLow(input.trim()));
  },

  // Sanitize and validate email
  email: (input: string): string => {
    const email = input.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    return email;
  },

  // Sanitize phone number (Ethiopian format)
  phone: (input: string): string => {
    // Remove all non-numeric characters except +
    const cleaned = input.replace(/[^0-9+]/g, '');
    
    // Ethiopian phone validation
    const ethiopianPattern = /^(\+251|251|0)?[97]\d{8}$/;
    if (!ethiopianPattern.test(cleaned)) {
      throw new ValidationError('Invalid Ethiopian phone number format');
    }
    
    // Normalize to +251 format
    if (cleaned.startsWith('0')) {
      return '+251' + cleaned.slice(1);
    } else if (cleaned.startsWith('251')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('+251')) {
      return cleaned;
    }
    return '+251' + cleaned;
  },

  // Sanitize URLs
  url: (input: string): string => {
    const url = input.trim();
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new ValidationError('Invalid URL format');
    }
    return url;
  },

  // Sanitize numeric IDs
  uuid: (input: string): string => {
    const cleaned = input.trim();
    if (!validator.isUUID(cleaned)) {
      throw new ValidationError('Invalid ID format');
    }
    return cleaned;
  },

  // Sanitize search queries
  searchQuery: (input: string): string => {
    // Remove special SQL characters
    return input
      .trim()
      .replace(/[;'"\\]/g, '')
      .substring(0, 100); // Limit length
  },
};
```

**Step 2**: Install validator if not present

```bash
npm install validator
npm install --save-dev @types/validator
```

**Step 3**: Update Zod schemas to include sanitization

```typescript
// In shared/schema.ts, enhance existing schemas

import { sanitize } from '../server/utils/sanitize';

// Add transform to existing schemas
export const insertCustomerSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1).max(100).transform(sanitize.text),
  email: (schema) => schema.email().transform(sanitize.email).optional(),
  phone: (schema) => schema.transform(sanitize.phone),
  address: (schema) => schema.transform(sanitize.text).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add similar transforms to other schemas
export const insertDeviceSchema = createInsertSchema(devices, {
  serialNumber: (schema) => schema.transform(sanitize.text).optional(),
  problemDescription: (schema) => schema.transform(sanitize.text),
  accessoryDescription: (schema) => schema.transform(sanitize.text).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
```

**Step 4**: Add validation middleware

```typescript
// server/middleware/validation.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error); // Will be caught by error handler
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

**Step 5**: Apply validation to routes

```typescript
// In server/routes.ts, update endpoints to use validation middleware

import { validateBody, validateParams, validateQuery } from './middleware/validation';

// Example: Customer creation
app.post(
  "/api/customers",
  authenticateAndFilter,
  validateBody(insertCustomerSchema),
  asyncHandler(async (req: any, res) => {
    // req.body is now validated and sanitized
    const customer = await storage.createCustomer(req.body, req.locationFilter);
    res.json(customer);
  })
);

// Example: Customer update
app.put(
  "/api/customers/:id",
  authenticateAndFilter,
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(insertCustomerSchema.partial()),
  asyncHandler(async (req: any, res) => {
    const customer = await storage.updateCustomer(req.params.id, req.body);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    res.json(customer);
  })
);

// Example: Search with query validation
const searchQuerySchema = z.object({
  q: z.string().min(1).max(100).transform(sanitize.searchQuery),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

app.get(
  "/api/customers/search",
  authenticateAndFilter,
  validateQuery(searchQuerySchema),
  asyncHandler(async (req: any, res) => {
    const results = await storage.searchCustomers(
      req.query.q,
      req.locationFilter,
      req.query.limit,
      req.query.offset
    );
    res.json(results);
  })
);
```

**Verification**:
- [ ] All POST/PUT/PATCH endpoints have validation
- [ ] Text inputs are sanitized
- [ ] Phone numbers are validated and normalized
- [ ] Emails are validated
- [ ] UUIDs are validated
- [ ] Search queries are sanitized
- [ ] Invalid data returns 400 with clear errors

---

## Session 3: Medium Priority Fixes

**Estimated Time**: 90-120 minutes  
**Risk Level**: Low  
**Requires Testing**: Yes  
**Dependencies**: Session 1-2 complete

### 🟠 Task 3.1: Add Pagination to List Endpoints

**Priority**: MEDIUM  
**Files**: `server/routes.ts`, `server/storage.ts`

**Current Issue**: List endpoints return all records, causing performance issues

**Action Required**:
1. Identify endpoints that return lists
2. Add pagination parameters
3. Return pagination metadata
4. Update frontend to handle pagination

**Fix Implementation**:

**Step 1**: Create pagination utilities

```typescript
// server/utils/pagination.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;

export function parsePaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
```

**Step 2**: Update storage methods to support pagination

```typescript
// In server/storage.ts, update list methods

async getCustomers(
  locationFilter: LocationFilter,
  paginationParams?: PaginationParams
): Promise<PaginatedResponse<Customer> | Customer[]> {
  // Build base query
  let query = db.select().from(customers);

  // Apply location filter
  if (!locationFilter.includeAllLocations && locationFilter.locationId) {
    query = query.where(eq(customers.locationId, locationFilter.locationId));
  }

  // If pagination requested
  if (paginationParams) {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationParams;
    const offset = calculateOffset(page, limit);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(
        !locationFilter.includeAllLocations && locationFilter.locationId
          ? eq(customers.locationId, locationFilter.locationId)
          : undefined
      );

    // Apply sorting and pagination
    const sortColumn = customers[sortBy as keyof typeof customers] || customers.createdAt;
    query = query
      .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    const data = await query;
    return createPaginatedResponse(data, Number(count), page, limit);
  }

  // Return all if no pagination
  return await query;
}

// Apply similar pattern to other list methods:
// - getDevices
// - getInventoryItems
// - getSales
// - getExpenses
// - getAppointments
```

**Step 3**: Update routes to support pagination

```typescript
// In server/routes.ts

import { parsePaginationParams } from './utils/pagination';

app.get("/api/customers", authenticateAndFilter, asyncHandler(async (req: any, res) => {
  const paginationParams = parsePaginationParams(req.query);
  const result = await storage.getCustomers(req.locationFilter, paginationParams);
  res.json(result);
}));

app.get("/api/devices", authenticateAndFilter, asyncHandler(async (req: any, res) => {
  const paginationParams = parsePaginationParams(req.query);
  const result = await storage.getDevices(req.locationFilter, paginationParams);
  res.json(result);
}));

// Update all list endpoints similarly
```

**Step 4**: Update frontend to handle pagination

```typescript
// client/src/lib/queryClient.ts - Update apiRequest to detect pagination

export async function apiRequest(
  path: string,
  method: string = "GET",
  body?: any,
  options?: { page?: number; limit?: number }
): Promise<any> {
  // Add pagination params if provided
  let url = path;
  if (options?.page || options?.limit) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    url = `${path}?${params.toString()}`;
  }

  // ... existing code ...
}
```

**Step 5**: Create pagination component for frontend

```tsx
// client/src/components/ui/pagination.tsx
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

**Step 6**: Update a sample page to use pagination

```tsx
// Example: client/src/pages/customers.tsx

import { Pagination } from '@/components/ui/pagination';

export default function Customers() {
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, limit],
    queryFn: () => apiRequest("/api/customers", "GET", undefined, { page, limit }),
  });

  return (
    <div>
      {/* Existing customer list */}
      {data?.data?.map(customer => (
        // render customer
      ))}

      {/* Add pagination */}
      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          hasNext={data.pagination.hasNext}
          hasPrev={data.pagination.hasPrev}
        />
      )}
    </div>
  );
}
```

**Verification**:
- [ ] List endpoints support pagination
- [ ] Default pagination limits are reasonable
- [ ] Total count is accurate
- [ ] Sorting works correctly
- [ ] Frontend displays pagination controls
- [ ] Page changes don't cause errors

---

### 🟠 Task 3.2: Remove Debug Code from Production

**Priority**: MEDIUM  
**Files**: Multiple across codebase

**Current Issue**: Debug code, console.log, and test routes in production

**Action Required**:
1. Remove debug routes
2. Replace console.log with proper logging
3. Remove debug flags
4. Clean up test code

**Fix Implementation**:

**Step 1**: Remove debug route

```typescript
// In client/src/App.tsx, remove lines around 198-203
// DELETE THIS:
<Route
  path="/debug"
  component={() => (
    <div>
      <h1>Debug Info</h1>
    </div>
  )}
/>
```

**Step 2**: Replace console.log with logger

Search and replace pattern:
```bash
# In server files
Find: console\.log\((.*)\)
Replace with: logger.info($1)

Find: console\.warn\((.*)\)
Replace with: logger.warn($1)

Find: console\.error\((.*)\)
Replace with: logger.error($1)
```

Example manual fixes:
```typescript
// In server/routes.ts, line 3254-3259
// BEFORE:
console.log("💰 Expenses endpoint called with locationFilter:", req.locationFilter);
const expenses = await storage.getExpenses(req.locationFilter);
console.log(`✅ Returning ${expenses.length} expenses`);

// AFTER:
logger.info('Expenses endpoint called', {
  locationFilter: req.locationFilter,
  userId: req.user.userId,
});
const expenses = await storage.getExpenses(req.locationFilter);
logger.info('Returning expenses', { count: expenses.length });
```

**Step 3**: Remove debug logging in client

```typescript
// In client/src/App.tsx, lines 116-117
// DELETE:
console.log("Router Debug:", { 
  // ...
});

// In client/src/pages/not-found.tsx, lines 11-12
// DELETE:
console.warn("404 Page Displayed:", {
  // ...
});

// In client/src/pages/notification-preferences.tsx, lines 360-361
// DELETE:
console.log("🔔 Notification Preferences Debug:", {
  // ...
});

// In client/src/pages/service-management.tsx, lines 202, 274
// DELETE debug comments and console.log

// In client/src/pages/loan-invoices.tsx, lines 217, 719, 2486
// DELETE debug logging

// In client/src/pages/inventory-management.tsx, line 133
// DELETE debug comment

// In client/src/components/purchase-order-modal.tsx, lines 473, 477, 517
// DELETE debug logging

// In client/src/pages/advanced-analytics.tsx, line 308
// DELETE debug comment
```

**Step 4**: Add production-safe logging wrapper for client

```typescript
// client/src/lib/logger.ts
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
    // TODO: Send to error tracking service in production
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
```

**Step 5**: Remove debug mode settings

```typescript
// In client/src/pages/settings.tsx.bak (if still exists), remove lines 198, 435, 3934-3943
// DELETE enable debug mode option from settings

// Update main.tsx to ensure debug logs are disabled in production (already done)
```

**Step 6**: Create a script to find remaining debug code

```typescript
// scripts/find-debug-code.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Searching for debug code...\n');

const patterns = [
  'console\\.log',
  'console\\.debug',
  'debugger',
  'TODO.*debug',
  'FIXME.*debug',
  'DEBUG.*true',
];

patterns.forEach(pattern => {
  console.log(`\nSearching for: ${pattern}`);
  try {
    const result = execSync(
      `grep -rn "${pattern}" client/src server --include="*.ts" --include="*.tsx"`,
      { encoding: 'utf-8' }
    );
    if (result) {
      console.log(result);
    }
  } catch (e) {
    // No matches found (grep returns exit code 1)
  }
});

console.log('\n✅ Debug code search complete');
```

**Verification**:
- [ ] No debug routes remain
- [ ] No console.log in server code
- [ ] Client console.log wrapped in dev check
- [ ] No debugger statements
- [ ] No debug flags in production builds

---

### 🟠 Task 3.3: Add Database Indexes for Performance

**Priority**: MEDIUM  
**Files**: Migration files, schema

**Current Issue**: Missing indexes on frequently queried columns

**Action Required**:
1. Identify slow queries
2. Add indexes to foreign keys
3. Add indexes to commonly filtered columns
4. Add composite indexes where needed

**Fix Implementation**:

**Step 1**: Create migration for indexes

```sql
-- migrations/XXXX_add_performance_indexes.sql

-- Indexes for devices table (most queried)
CREATE INDEX IF NOT EXISTS idx_devices_customer_id ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_location_id ON devices(location_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_receipt_number ON devices(receipt_number);
-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_devices_location_status ON devices(location_id, status);

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
-- For search functionality
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING gin(name gin_trgm_ops);

-- Indexes for inventory_items table
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_level ON inventory_items(quantity);
-- Composite for low stock alerts
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(location_id, quantity) 
  WHERE quantity <= minimum_stock;

-- Indexes for sales table
CREATE INDEX IF NOT EXISTS idx_sales_location_id ON sales(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
-- Composite for sales reports
CREATE INDEX IF NOT EXISTS idx_sales_location_date ON sales(location_id, created_at DESC);

-- Indexes for sale_items table
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
-- Composite for calendar views
CREATE INDEX IF NOT EXISTS idx_appointments_location_date ON appointments(location_id, appointment_date);

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_location_id ON expenses(location_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
-- Composite for expense reports
CREATE INDEX IF NOT EXISTS idx_expenses_location_date ON expenses(location_id, expense_date DESC);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Indexes for notifications table (if exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- Composite for unread notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) 
  WHERE read = false;

-- Indexes for device_activities table (if exists)
CREATE INDEX IF NOT EXISTS idx_device_activities_device_id ON device_activities(device_id);
CREATE INDEX IF NOT EXISTS idx_device_activities_user_id ON device_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_device_activities_created_at ON device_activities(created_at DESC);

-- Indexes for purchase_orders table
CREATE INDEX IF NOT EXISTS idx_purchase_orders_location_id ON purchase_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at DESC);

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index for full-text search on problem descriptions
CREATE INDEX IF NOT EXISTS idx_devices_problem_search ON devices USING gin(problem_description gin_trgm_ops);

-- Statistics update for query planner
ANALYZE devices;
ANALYZE customers;
ANALYZE inventory_items;
ANALYZE sales;
ANALYZE appointments;
ANALYZE expenses;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Performance indexes created successfully';
END $$;
```

**Step 2**: Update schema to include indexes

```typescript
// In shared/schema.ts, add index definitions

export const devices = pgTable("devices", {
  // ... existing columns ...
}, (table) => ({
  // Define indexes in schema
  customerIdIdx: index("idx_devices_customer_id").on(table.customerId),
  locationIdIdx: index("idx_devices_location_id").on(table.locationId),
  statusIdx: index("idx_devices_status").on(table.status),
  createdAtIdx: index("idx_devices_created_at").on(table.createdAt),
  receiptNumberIdx: index("idx_devices_receipt_number").on(table.receiptNumber),
  locationStatusIdx: index("idx_devices_location_status").on(table.locationId, table.status),
}));

// Apply similar pattern to other tables
```

**Step 3**: Run migration

```bash
# Run the migration
npm run db:migrate

# Or manually if needed
psql -U your_username -d your_database -f migrations/XXXX_add_performance_indexes.sql
```

**Step 4**: Create script to analyze query performance

```typescript
// scripts/analyze-queries.ts
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function analyzeQueries() {
  console.log('📊 Analyzing query performance...\n');

  // Enable query timing
  await db.execute(sql`EXPLAIN ANALYZE SELECT * FROM devices WHERE location_id = 'test' AND status = 'pending'`);
  
  // Check index usage
  const indexUsage = await db.execute(sql`
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan as index_scans,
      idx_tup_read as tuples_read,
      idx_tup_fetch as tuples_fetched
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
  `);

  console.log('Index Usage Statistics:');
  console.table(indexUsage.rows);

  // Check table sizes
  const tableSizes = await db.execute(sql`
    SELECT 
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  `);

  console.log('\nTable Sizes:');
  console.table(tableSizes.rows);

  // Check slow queries
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`);
  const slowQueries = await db.execute(sql`
    SELECT 
      query,
      calls,
      total_time,
      mean_time,
      max_time
    FROM pg_stat_statements
    ORDER BY mean_time DESC
    LIMIT 10;
  `);

  console.log('\nSlowest Queries:');
  console.table(slowQueries.rows);
}

analyzeQueries().catch(console.error);
```

**Verification**:
- [ ] All indexes created successfully
- [ ] Query performance improved
- [ ] Index usage is high on frequently queried columns
- [ ] No duplicate indexes
- [ ] Database size increase is reasonable

---

### 🟠 Task 3.4: Implement Data Import Validation

**Priority**: MEDIUM  
**Files**: `client/src/components/import-export.tsx`, `server/routes.ts`

**Current Issue**: Import data not properly validated, errors not clear

**Action Required**:
1. Add comprehensive validation for imports
2. Provide clear error messages
3. Add dry-run mode
4. Implement rollback on failure

**Fix Implementation**:

**Step 1**: Create import validation service

```typescript
// server/utils/import-validator.ts
import { z } from 'zod';
import { sanitize } from './sanitize';

export interface ImportResult {
  success: boolean;
  validRecords: any[];
  errors: ImportError[];
  warnings: ImportWarning[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
}

export class ImportValidator {
  async validateCustomers(data: any[]): Promise<ImportResult> {
    const validRecords: any[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Define schema for customer import
    const customerImportSchema = z.object({
      name: z.string().min(1).max(100),
      phone: z.string().min(10),
      email: z.string().email().optional().or(z.literal('')),
      address: z.string().max(500).optional().or(z.literal('')),
    });

    for (let i = 0; i < data.length; i++) {
      const row = i + 2; // +2 for header row and 1-based indexing
      const record = data[i];

      try {
        // Validate and sanitize
        const validated = customerImportSchema.parse({
          name: record.name?.trim() || '',
          phone: record.phone?.toString().trim() || '',
          email: record.email?.trim() || '',
          address: record.address?.trim() || '',
        });

        // Additional validations
        try {
          validated.phone = sanitize.phone(validated.phone);
        } catch (e) {
          errors.push({
            row,
            field: 'phone',
            message: 'Invalid phone number format',
            value: validated.phone,
          });
          continue;
        }

        if (validated.email) {
          try {
            validated.email = sanitize.email(validated.email);
          } catch (e) {
            errors.push({
              row,
              field: 'email',
              message: 'Invalid email format',
              value: validated.email,
            });
            continue;
          }
        }

        // Check for duplicates in import data
        const duplicate = validRecords.find(r => r.phone === validated.phone);
        if (duplicate) {
          warnings.push({
            row,
            field: 'phone',
            message: 'Duplicate phone number in import file',
          });
        }

        validRecords.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row,
              field: err.path.join('.'),
              message: err.message,
              value: record[err.path[0]],
            });
          });
        } else {
          errors.push({
            row,
            message: 'Unknown validation error',
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      validRecords,
      errors,
      warnings,
      summary: {
        total: data.length,
        valid: validRecords.length,
        invalid: errors.length,
        warnings: warnings.length,
      },
    };
  }

  async validateInventory(data: any[]): Promise<ImportResult> {
    // Similar implementation for inventory
    // ...
  }

  async validateProducts(data: any[]): Promise<ImportResult> {
    // Similar implementation for products
    // ...
  }
}

export const importValidator = new ImportValidator();
```

**Step 2**: Update import endpoint with validation

```typescript
// In server/routes.ts, update import endpoint

app.post(
  "/api/import/customers",
  authenticateAndFilter,
  upload.single("file"),
  validateFileUpload,
  asyncHandler(async (req: any, res) => {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError();
    }

    const dryRun = req.body.dryRun === 'true';
    const file = req.file;

    // Parse Excel file
    const workbook = ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];

    // Convert to JSON
    const data: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      data.push({
        name: row.getCell(1).value,
        phone: row.getCell(2).value,
        email: row.getCell(3).value,
        address: row.getCell(4).value,
      });
    });

    // Validate data
    const validationResult = await importValidator.validateCustomers(data);

    // If dry run, return validation results only
    if (dryRun) {
      return res.json({
        success: true,
        dryRun: true,
        validation: validationResult,
      });
    }

    // If validation failed, return errors
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Import validation failed',
        validation: validationResult,
      });
    }

    // Import valid records in transaction
    const imported: any[] = [];
    const failed: any[] = [];

    try {
      await db.transaction(async (tx) => {
        for (const record of validationResult.validRecords) {
          try {
            const customer = await storage.createCustomer(
              { ...record, locationId: req.locationFilter.locationId },
              req.locationFilter
            );
            imported.push(customer);
          } catch (error) {
            failed.push({
              record,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            // If any fail, rollback transaction
            throw error;
          }
        }
      });

      logger.info('Import completed successfully', {
        imported: imported.length,
        userId: req.user.userId,
      });

      res.json({
        success: true,
        imported: imported.length,
        failed: failed.length,
        warnings: validationResult.warnings.length,
        details: {
          imported,
          failed,
          warnings: validationResult.warnings,
        },
      });
    } catch (error) {
      logger.error('Import failed, transaction rolled back', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user.userId,
      });

      res.status(500).json({
        success: false,
        message: 'Import failed and was rolled back',
        imported: 0,
        failed: validationResult.validRecords.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);
```

**Step 3**: Update frontend to show validation results

```tsx
// In client/src/components/import-export.tsx

const [validationResults, setValidationResults] = useState<any>(null);
const [isDryRun, setIsDryRun] = useState(true);

const handleImport = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dryRun', String(isDryRun));

  try {
    const response = await fetch(`/api/import/${type}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.dryRun) {
      // Show validation results
      setValidationResults(result.validation);
      toast({
        title: 'Validation Complete',
        description: `${result.validation.summary.valid} valid, ${result.validation.summary.invalid} invalid`,
      });
    } else if (result.success) {
      // Import successful
      toast({
        title: 'Import Successful',
        description: `Imported ${result.imported} records`,
      });
      setValidationResults(null);
      setIsDryRun(true);
    } else {
      // Import failed
      toast({
        title: 'Import Failed',
        description: result.message,
        variant: 'destructive',
      });
      setValidationResults(result.validation);
    }
  } catch (error) {
    toast({
      title: 'Import Error',
      description: 'Failed to import file',
      variant: 'destructive',
    });
  }
};

// Add validation results display
{validationResults && (
  <Card>
    <CardHeader>
      <CardTitle>Validation Results</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{validationResults.summary.total}</div>
            <div className="text-sm text-slate-600">Total Rows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {validationResults.summary.valid}
            </div>
            <div className="text-sm text-slate-600">Valid</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {validationResults.summary.invalid}
            </div>
            <div className="text-sm text-slate-600">Invalid</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {validationResults.summary.warnings}
            </div>
            <div className="text-sm text-slate-600">Warnings</div>
          </div>
        </div>

        {/* Errors */}
        {validationResults.errors.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-600 mb-2">Errors</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validationResults.errors.map((error: any, idx: number) => (
                <Alert key={idx} variant="destructive">
                  <AlertDescription>
                    Row {error.row}: {error.field && `${error.field} - `}
                    {error.message}
                    {error.value && ` (value: ${error.value})`}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {validationResults.warnings.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-600 mb-2">Warnings</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {validationResults.warnings.map((warning: any, idx: number) => (
                <Alert key={idx}>
                  <AlertDescription>
                    Row {warning.row}: {warning.field && `${warning.field} - `}
                    {warning.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {validationResults.summary.valid > 0 && (
            <Button
              onClick={() => {
                setIsDryRun(false);
                // Re-run import with dry run false
              }}
            >
              Import {validationResults.summary.valid} Valid Records
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setValidationResults(null)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

**Verification**:
- [ ] Import validates all fields
- [ ] Errors show row numbers and specific issues
- [ ] Dry run mode works correctly
- [ ] Successful import commits all records
- [ ] Failed import rolls back all records
- [ ] Warnings don't block import
- [ ] Duplicate detection works

---

## Session 4: Low Priority Cleanup

**Estimated Time**: 60-90 minutes  
**Risk Level**: Very Low  
**Requires Testing**: Limited  
**Dependencies**: All previous sessions

### 🟢 Task 4.1: Clean Up Large Files

**Priority**: LOW  
**Files**: Large component files

**Current Issue**: Some files are too large (2000+ lines)

**Action Required**:
1. Identify large files
2. Split into smaller components
3. Extract utility functions
4. Improve code organization

**Fix Implementation**:

Example for `analytics-hub.tsx` (2056 lines):

**Step 1**: Split into separate components

```typescript
// Create client/src/pages/analytics/overview-module.tsx
export function OverviewModule({ overviewData, analyticsState }: Props) {
  // Extract lines 1354-2040 from analytics-hub.tsx
  // ...
}

// Create client/src/pages/analytics/expense-analytics-module.tsx
export function ExpenseAnalyticsModule() {
  // Extract lines 243-932 from analytics-hub.tsx
  // ...
}

// Create client/src/pages/analytics/analytics-module-card.tsx
export function AnalyticsModule({ title, icon, children, badge }: Props) {
  // Extract lines 214-240
  // ...
}
```

**Step 2**: Update main file to use extracted components

```typescript
// client/src/pages/analytics-hub.tsx (now ~500 lines)
import { OverviewModule } from './analytics/overview-module';
import { ExpenseAnalyticsModule } from './analytics/expense-analytics-module';
import { AnalyticsModule } from './analytics/analytics-module-card';

export default function AnalyticsHub() {
  // Keep only main component logic
  // Import and use extracted components
}
```

**Verification**:
- [ ] Files are under 500 lines each
- [ ] Components are properly organized
- [ ] No functionality broken
- [ ] Imports work correctly

---

### 🟢 Task 4.2: Add Accessibility Improvements

**Priority**: LOW  
**Files**: Multiple component files

**Current Issue**: Missing ARIA labels and keyboard navigation

**Action Required**:
1. Add ARIA labels to interactive elements
2. Improve keyboard navigation
3. Add focus indicators
4. Test with screen reader

**Fix Implementation**:

```tsx
// Example improvements in various components

// Add ARIA labels to buttons
<Button
  aria-label="Refresh analytics data"
  onClick={refresh}
>
  <RefreshCw className="h-4 w-4" />
</Button>

// Add ARIA labels to icons
<TrendingUp 
  className="h-4 w-4"
  aria-hidden="true"
  role="img"
  aria-label="Trending up icon"
/>

// Add keyboard navigation to custom components
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
  Custom Clickable
</div>

// Add focus indicators
<Button
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  Accessible Button
</Button>

// Add skip to content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white"
>
  Skip to main content
</a>
```

**Verification**:
- [ ] All interactive elements have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible

---

### 🟢 Task 4.3: Update Documentation

**Priority**: LOW  
**Files**: README.md, documentation files

**Current Issue**: Incomplete setup and deployment instructions

**Action Required**:
1. Update README with complete setup instructions
2. Add deployment guide
3. Document environment variables
4. Add troubleshooting section

**Fix Implementation**:

```markdown
# README.md

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables
Copy `.env.template` to `.env` and configure:

\`\`\`bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/solnet

# Security (REQUIRED in production)
JWT_SECRET=your-secret-key-min-32-characters

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

# SMS Configuration (optional)
ETHIO_TELECOM_API_KEY=your-api-key
ETHIO_TELECOM_SHORTCODE=your-shortcode

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Server
PORT=5000
NODE_ENV=development
\`\`\`

### Installation

1. Clone repository
2. Install dependencies: `npm install`
3. Setup database: `npm run db:migrate`
4. Seed demo data (optional): `npm run db:seed`
5. Start development: `npm run dev`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Troubleshooting

**Issue**: JWT_SECRET error on startup
**Solution**: Ensure JWT_SECRET is set in .env file and is at least 32 characters

**Issue**: SMS not sending
**Solution**: Check SMS queue table, verify API credentials

**Issue**: CORS errors
**Solution**: Add your frontend URL to CORS_ORIGINS environment variable
```

**Verification**:
- [ ] README is complete and accurate
- [ ] All environment variables documented
- [ ] Deployment guide exists
- [ ] Troubleshooting section helpful

---

## Testing & Validation

### Automated Testing Checklist

Create test script:

```typescript
// scripts/validate-fixes.ts
import { execSync } from 'child_process';

console.log('🧪 Running validation tests...\n');

const tests = [
  {
    name: 'TypeScript compilation',
    command: 'npm run build',
  },
  {
    name: 'Linting',
    command: 'npm run lint',
  },
  {
    name: 'Find console.log in server',
    command: 'grep -rn "console\\.log" server --include="*.ts" || true',
    expectEmpty: true,
  },
  {
    name: 'Find empty catch blocks',
    command: 'grep -rn "catch.*{[\s]*}" server --include="*.ts" || true',
    expectEmpty: true,
  },
  {
    name: 'Find TODO/FIXME',
    command: 'grep -rn "TODO\\|FIXME" client/src server --include="*.ts" --include="*.tsx" | wc -l',
  },
];

tests.forEach(test => {
  console.log(`\n▶️  ${test.name}`);
  try {
    const result = execSync(test.command, { encoding: 'utf-8' });
    if (test.expectEmpty && result.trim()) {
      console.log('❌ FAILED - Output should be empty');
      console.log(result);
    } else {
      console.log('✅ PASSED');
      if (result.trim()) console.log(result);
    }
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log(error.stdout || error.message);
  }
});

console.log('\n✅ Validation complete');
```

### Manual Testing Checklist

- [ ] Login with rate limiting (try 6 times)
- [ ] Create customer with invalid phone (should fail)
- [ ] Import customers with validation errors (check errors)
- [ ] Send SMS and check queue
- [ ] View paginated list of customers
- [ ] Check console for console.log statements
- [ ] Verify CORS with different origins
- [ ] Upload invalid file type (should fail)
- [ ] Test error handling on 404 route
- [ ] Check that debug route is removed

---

## Rollback Procedures

### If Critical Issues Found

1. **Database Rollback**:
```bash
# List migrations
psql -U user -d database -c "SELECT * FROM migrations ORDER BY created_at DESC LIMIT 5;"

# Rollback last migration
psql -U user -d database -f migrations/rollback/XXXX_rollback_indexes.sql
```

2. **Code Rollback**:
```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard commit-hash
```

3. **Server Restart**:
```bash
# Stop server
pm2 stop solnet

# Restore backup
cp -r backup/ .

# Restart
pm2 start solnet
```

---

## Progress Tracking

### Session 1 Completion Criteria
- [ ] JWT secret validation works
- [ ] No empty catch blocks
- [ ] Rate limiting functional
- [ ] CORS properly configured
- [ ] File uploads validated

### Session 2 Completion Criteria
- [ ] Error handling centralized
- [ ] SMS errors tracked
- [ ] All inputs validated
- [ ] Sanitization working

### Session 3 Completion Criteria
- [ ] Pagination implemented
- [ ] Debug code removed
- [ ] Indexes created
- [ ] Import validation working

### Session 4 Completion Criteria
- [ ] Large files split
- [ ] Accessibility improved
- [ ] Documentation complete
- [ ] All tests passing

---

## Final Validation

Run complete validation:

```bash
# Run all checks
npm run validate-fixes

# Test production build
npm run build
NODE_ENV=production npm start

# Manual smoke tests
# - Login
# - Create record
# - Import data
# - Send SMS
# - View analytics

# Check logs for errors
tail -f logs/app.log | grep ERROR
```

---

## Success Metrics

- [ ] No console.log in server code
- [ ] No empty catch blocks
- [ ] All endpoints have rate limiting
- [ ] All endpoints have validation
- [ ] All endpoints have error handling
- [ ] All lists paginated
- [ ] No debug routes accessible
- [ ] Documentation complete
- [ ] All tests passing
- [ ] Production build successful

---

## Notes for AI Agent

1. **Approach**: Execute tasks sequentially within each session
2. **Testing**: Test after each major change
3. **Logging**: Log all changes made
4. **Backup**: Keep backups before major changes
5. **Validation**: Run validation scripts after each session
6. **Communication**: Report progress and issues clearly
7. **Dependencies**: Respect task dependencies
8. **Rollback**: Be prepared to rollback if issues found

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-18  
**Maintained By**: System Administrator

