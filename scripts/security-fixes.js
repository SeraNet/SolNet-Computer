#!/usr/bin/env node

/**
 * Security Fixes Implementation Script
 *
 * This script helps implement critical security fixes identified in the system analysis.
 * Run this script to automatically apply security improvements.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔒 SolNet Security Fixes Implementation");
console.log("=====================================\n");

// 1. Fix JWT Secret in routes.ts
function fixJWTSecret() {
  console.log("1. Fixing JWT Secret configuration...");

  const routesPath = path.join(__dirname, "..", "server", "routes.ts");

  if (!fs.existsSync(routesPath)) {
    console.log("❌ routes.ts not found");
    return false;
  }

  let content = fs.readFileSync(routesPath, "utf8");

  // Replace hardcoded JWT secret with environment-only approach
  const oldPattern =
    /const JWT_SECRET = process\.env\.JWT_SECRET \|\| "dev-secret-change-me";/;
  const newPattern = `const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}`;

  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(routesPath, content);
    console.log("✅ JWT Secret configuration fixed");
    return true;
  } else {
    console.log("⚠️  JWT Secret pattern not found or already fixed");
    return false;
  }
}

// 2. Fix CORS configuration
function fixCORS() {
  console.log("\n2. Fixing CORS configuration...");

  const serverPath = path.join(__dirname, "..", "server", "index.ts");

  if (!fs.existsSync(serverPath)) {
    console.log("❌ server/index.ts not found");
    return false;
  }

  let content = fs.readFileSync(serverPath, "utf8");

  // Replace hardcoded CORS with environment-based configuration
  const oldCORS = `app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Selected-Location"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});`;

  const newCORS = `// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use((req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Selected-Location"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});`;

  if (
    content.includes(
      'res.header("Access-Control-Allow-Origin", "http://localhost:5173")'
    )
  ) {
    content = content.replace(oldCORS, newCORS);
    fs.writeFileSync(serverPath, content);
    console.log("✅ CORS configuration fixed");
    return true;
  } else {
    console.log("⚠️  CORS pattern not found or already fixed");
    return false;
  }
}

// 3. Add file upload validation
function addFileUploadValidation() {
  console.log("\n3. Adding file upload validation...");

  const routesPath = path.join(__dirname, "..", "server", "routes.ts");

  if (!fs.existsSync(routesPath)) {
    console.log("❌ routes.ts not found");
    return false;
  }

  let content = fs.readFileSync(routesPath, "utf8");

  // Add file validation middleware
  const fileValidationMiddleware = `
// File upload validation middleware
const validateFileUpload = (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      message: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed' 
    });
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ 
      message: 'File too large. Maximum size is 10MB' 
    });
  }
  
  next();
};`;

  // Add the middleware after the multer configuration
  const multerConfig = `const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });`;

  const newMulterConfig = `const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

${fileValidationMiddleware}`;

  if (
    content.includes(multerConfig) &&
    !content.includes("validateFileUpload")
  ) {
    content = content.replace(multerConfig, newMulterConfig);
    fs.writeFileSync(routesPath, content);
    console.log("✅ File upload validation added");
    return true;
  } else {
    console.log(
      "⚠️  File upload validation already exists or pattern not found"
    );
    return false;
  }
}

// 4. Update environment template
function updateEnvTemplate() {
  console.log("\n4. Updating environment template...");

  const envTemplatePath = path.join(__dirname, "..", "env.template");

  if (!fs.existsSync(envTemplatePath)) {
    console.log("❌ env.template not found");
    return false;
  }

  let content = fs.readFileSync(envTemplatePath, "utf8");

  // Add new security-related environment variables
  const securityVars = `
# Security Configuration
# Comma-separated list of allowed origins for CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true

# Security Headers
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=true`;

  if (!content.includes("ALLOWED_ORIGINS")) {
    content += securityVars;
    fs.writeFileSync(envTemplatePath, content);
    console.log("✅ Environment template updated with security variables");
    return true;
  } else {
    console.log("⚠️  Security variables already exist in env.template");
    return false;
  }
}

// 5. Create security middleware
function createSecurityMiddleware() {
  console.log("\n5. Creating security middleware...");

  const middlewareDir = path.join(__dirname, "..", "server", "middleware");
  const securityPath = path.join(middlewareDir, "security.ts");

  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true });
  }

  if (fs.existsSync(securityPath)) {
    console.log("⚠️  Security middleware already exists");
    return false;
  }

  const securityMiddleware = `import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value.replace(/[<>]/g, '');
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};

// Authentication validation middleware
export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Token validation logic would go here
  // For now, just check if token exists
  next();
};`;

  fs.writeFileSync(securityPath, securityMiddleware);
  console.log("✅ Security middleware created");
  return true;
}

// Main execution
async function main() {
  try {
    const results = {
      jwtSecret: fixJWTSecret(),
      cors: fixCORS(),
      fileUpload: addFileUploadValidation(),
      envTemplate: updateEnvTemplate(),
      securityMiddleware: createSecurityMiddleware(),
    };

    console.log("\n📊 Security Fixes Summary:");
    console.log("========================");
    console.log(`JWT Secret Fix: ${results.jwtSecret ? "✅" : "❌"}`);
    console.log(`CORS Configuration: ${results.cors ? "✅" : "❌"}`);
    console.log(`File Upload Validation: ${results.fileUpload ? "✅" : "❌"}`);
    console.log(`Environment Template: ${results.envTemplate ? "✅" : "❌"}`);
    console.log(
      `Security Middleware: ${results.securityMiddleware ? "✅" : "❌"}`
    );

    console.log("\n🔧 Next Steps:");
    console.log("1. Install additional dependencies:");
    console.log("   npm install express-rate-limit helmet");
    console.log("   npm install --save-dev @types/express-rate-limit");
    console.log("\n2. Update your .env file with the new security variables");
    console.log(
      "\n3. Import and use the security middleware in your server/index.ts"
    );
    console.log("\n4. Test all file upload endpoints with the new validation");
    console.log("\n5. Review and update CORS origins for production");
  } catch (error) {
    console.error("❌ Error during security fixes:", error);
    process.exit(1);
  }
}

main();
