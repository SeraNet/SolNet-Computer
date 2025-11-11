import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load environment variables
dotenv.config();
import { registerRoutes } from "./routes";
import { initializeDb } from "./db";
import { setupVite, serveStatic, log } from "./vite";
import { logger } from "./utils/logger";
import {
  rateLimiter,
  securityHeaders,
  sanitizeInput,
} from "./middleware/security";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Trust proxy for secure cookies and proper IP detection
app.set("trust proxy", 1);

// Reduce noisy logs in non-debug environments
if ((process.env.ENABLE_DEBUG_LOGS || "").toLowerCase() !== "true") {
  const noop = () => {};
  // Keep console.error and console.warn; silence verbose logs
  // Only applies to server process, not build tools
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = noop as any;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.info = noop as any;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.debug = noop as any;
}

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter); // Re-enabled for production security
app.use(sanitizeInput);

// CORS middleware - Environment-based configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:5000", "http://localhost:4173"];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`, {
        origin,
        allowedOrigins,
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-selected-location', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight for 10 minutes
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initializeDb();
  
  // Critical: Validate JWT_SECRET before starting server
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me') {
    logger.error('❌ CRITICAL: JWT_SECRET environment variable must be set to a secure value');
    logger.error('Please set JWT_SECRET in your .env file with a secure random string (min 32 characters)');
    process.exit(1);
  }
  
  const server = await registerRoutes(app);

  // Start SMS processor for background SMS delivery
  const { smsProcessor } = await import('./sms-processor');
  smsProcessor.start(30000); // Process every 30 seconds
  logger.info('SMS processor started');

  // 404 handler - must come before error handler
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  // Skip Vite setup in development - let Vite dev server handle the client
  // This prevents conflicts between the server and Vite dev server
  if (app.get("env") !== "development") {
    serveStatic(app);
  }
  // In development, we only serve the API, Vite dev server handles the client

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const startPort = parseInt(process.env.PORT || "5000", 10);

  function tryPort(port: number, maxAttempts: number = 10): void {
    if (maxAttempts <= 0) {
      log(`Failed to find available port after 10 attempts. Exiting.`);
      process.exit(1);
    }

    server
      .listen(port, () => {
        logger.info(`serving on port ${port}`);
      })
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          logger.warn(
            `Port ${port} is already in use. Trying port ${port + 1}...`
          );
          tryPort(port + 1, maxAttempts - 1);
        } else {
          logger.error(`Server error: ${err.message}`);
          process.exit(1);
        }
      });
  }

  tryPort(startPort);

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    
    // Stop SMS processor
    const { smsProcessor } = await import('./sms-processor');
    smsProcessor.stop();
    
    // Close server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit after 30 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
