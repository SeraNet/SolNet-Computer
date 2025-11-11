#!/usr/bin/env node

/**
 * CPanel-specific Server Entry Point
 * This file is used to start the application in CPanel environments
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me') {
  console.error('❌ CRITICAL: JWT_SECRET environment variable must be set to a secure value');
  console.error('Please set JWT_SECRET in your .env file with a secure random string (min 32 characters)');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL environment variable must be set');
  console.error('Please set DATABASE_URL in your .env file with your database connection string');
  process.exit(1);
}

// Import and start the actual server
console.log('Starting SolNet Management System server...');
console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Port:', process.env.PORT || 5000);

try {
  // Import the built server
  await import('./dist/server/index.js');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}


