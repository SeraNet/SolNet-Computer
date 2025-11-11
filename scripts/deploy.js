#!/usr/bin/env node

/**
 * Deployment script for SolNetManage
 * Handles build, database migrations, and deployment verification
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    log(`Running: ${command}`, "cyan");
    const result = execSync(command, {
      stdio: "inherit",
      encoding: "utf8",
      ...options,
    });
    return result;
  } catch (error) {
    log(`Error running command: ${command}`, "red");
    log(error.message, "red");
    process.exit(1);
  }
}

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`Required file missing: ${filePath}`, "red");
    return false;
  }
  return true;
}

function checkEnvironmentVariables() {
  const required = ["DATABASE_URL", "JWT_SECRET", "SESSION_SECRET", "NODE_ENV"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    log(`Missing required environment variables: ${missing.join(", ")}`, "red");
    log("Please set these variables before deploying", "yellow");
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    log('Warning: NODE_ENV is not set to "production"', "yellow");
  }

  return true;
}

async function main() {
  log("🚀 Starting SolNetManage deployment process...", "bright");

  // Step 1: Check environment
  log("\n📋 Step 1: Checking environment...", "blue");
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }
  log("✅ Environment variables check passed", "green");

  // Step 2: Install dependencies
  log("\n📦 Step 2: Installing dependencies...", "blue");
  exec("npm ci --omit=dev");
  log("✅ Dependencies installed", "green");

  // Step 3: Type check
  log("\n🔍 Step 3: Running type check...", "blue");
  exec("npm run check");
  log("✅ Type check passed", "green");

  // Step 4: Build application
  log("\n🏗️  Step 4: Building application...", "blue");
  exec("npm run build");

  // Verify build output
  const distIndex = path.join(process.cwd(), "dist", "index.js");
  const distPublic = path.join(process.cwd(), "dist", "public", "index.html");

  if (!checkFileExists(distIndex)) {
    log("Build failed: dist/index.js not found", "red");
    process.exit(1);
  }

  if (!checkFileExists(distPublic)) {
    log("Build failed: dist/public/index.html not found", "red");
    process.exit(1);
  }

  log("✅ Application built successfully", "green");

  // Step 5: Database migrations
  log("\n🗄️  Step 5: Running database migrations...", "blue");
  try {
    exec("npm run db:push");
    log("✅ Database migrations completed", "green");
  } catch (error) {
    log("⚠️  Database migration failed, but continuing...", "yellow");
    log("You may need to run migrations manually", "yellow");
  }

  // Step 6: Verify database connection
  log("\n🔗 Step 6: Verifying database connection...", "blue");
  try {
    exec("npm run db:verify");
    log("✅ Database connection verified", "green");
  } catch (error) {
    log("⚠️  Database verification failed", "yellow");
    log("Please check your DATABASE_URL and database status", "yellow");
  }

  // Step 7: Create uploads directory
  log("\n📁 Step 7: Setting up uploads directory...", "blue");
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    log("✅ Uploads directory created", "green");
  } else {
    log("✅ Uploads directory already exists", "green");
  }

  // Step 8: Final verification
  log("\n✅ Step 8: Final deployment verification...", "blue");

  const requiredFiles = [
    "dist/index.js",
    "dist/public/index.html",
    "package.json",
  ];

  const allFilesExist = requiredFiles.every((file) =>
    checkFileExists(path.join(process.cwd(), file))
  );

  if (allFilesExist) {
    log("🎉 Deployment preparation completed successfully!", "green");
    log("\nNext steps:", "bright");
    log("1. Start the application: npm start", "cyan");
    log(
      "2. Test the health endpoint: curl http://localhost:5000/api/health",
      "cyan"
    );
    log("3. Verify the application is working correctly", "cyan");
  } else {
    log("❌ Deployment preparation failed", "red");
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  log(`Uncaught Exception: ${error.message}`, "red");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log(`Unhandled Rejection: ${reason}`, "red");
  process.exit(1);
});

// Run the deployment script
main().catch((error) => {
  log(`Deployment failed: ${error.message}`, "red");
  process.exit(1);
});

