#!/usr/bin/env node

/**
 * Console Log Cleanup Script
 *
 * This script removes console.log statements from the codebase
 * to improve performance and security for production.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧹 Console Log Cleanup Script");
console.log("============================\n");

// Directories to scan
const directories = ["client/src", "server", "scripts"];

// File extensions to process
const extensions = [".ts", ".tsx", ".js", ".jsx"];

// Patterns to match console statements
const consolePatterns = [
  /console\.log\([^)]*\);?/g,
  /console\.error\([^)]*\);?/g,
  /console\.warn\([^)]*\);?/g,
  /console\.info\([^)]*\);?/g,
  /console\.debug\([^)]*\);?/g,
];

// Files to exclude from cleanup
const excludeFiles = [
  "cleanup-console-logs.js",
  "security-fixes.js",
  "setup-database.js",
];

// Keep certain console statements (for debugging scripts)
const keepPatterns = [
  /console\.log\(['"]🔧.*['"]\)/g,
  /console\.log\(['"]✅.*['"]\)/g,
  /console\.log\(['"]❌.*['"]\)/g,
  /console\.log\(['"]⚠️.*['"]\)/g,
  /console\.log\(['"]📊.*['"]\)/g,
  /console\.log\(['"]🎉.*['"]\)/g,
  /console\.log\(['"]🚀.*['"]\)/g,
  /console\.log\(['"]🔍.*['"]\)/g,
  /console\.log\(['"]📱.*['"]\)/g,
  /console\.log\(['"]🗄️.*['"]\)/g,
  /console\.log\(['"]📝.*['"]\)/g,
  /console\.log\(['"]📚.*['"]\)/g,
  /console\.log\(['"]🔒.*['"]\)/g,
  /console\.log\(['"]🧹.*['"]\)/g,
];

function shouldKeepConsoleStatement(line) {
  return keepPatterns.some((pattern) => pattern.test(line));
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;
    let removedCount = 0;

    const newLines = lines.map((line) => {
      const trimmedLine = line.trim();

      // Check if this line contains a console statement
      const hasConsole = consolePatterns.some((pattern) =>
        pattern.test(trimmedLine)
      );

      if (hasConsole) {
        // Check if we should keep this console statement
        if (shouldKeepConsoleStatement(trimmedLine)) {
          return line; // Keep the line
        } else {
          removedCount++;
          modified = true;
          return ""; // Remove the line
        }
      }

      return line;
    });

    if (modified) {
      // Remove empty lines that were created by removing console statements
      const cleanedLines = newLines.filter((line) => line !== "");
      const newContent = cleanedLines.join("\n");

      fs.writeFileSync(filePath, newContent);
      return { modified: true, removedCount };
    }

    return { modified: false, removedCount: 0 };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return { modified: false, removedCount: 0, error: error.message };
  }
}

function scanDirectory(dirPath) {
  const results = {
    filesProcessed: 0,
    filesModified: 0,
    totalRemoved: 0,
    errors: [],
  };

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const subResults = scanDirectory(fullPath);
        results.filesProcessed += subResults.filesProcessed;
        results.filesModified += subResults.filesModified;
        results.totalRemoved += subResults.totalRemoved;
        results.errors.push(...subResults.errors);
      } else if (stat.isFile()) {
        // Check if file should be processed
        const ext = path.extname(item);
        const shouldProcess =
          extensions.includes(ext) && !excludeFiles.includes(item);

        if (shouldProcess) {
          results.filesProcessed++;
          const result = processFile(fullPath);

          if (result.error) {
            results.errors.push({ file: fullPath, error: result.error });
          } else if (result.modified) {
            results.filesModified++;
            results.totalRemoved += result.removedCount;
            console.log(
              `✅ Cleaned ${fullPath} (removed ${result.removedCount} console statements)`
            );
          }
        }
      }
    }
  } catch (error) {
    results.errors.push({ directory: dirPath, error: error.message });
  }

  return results;
}

function main() {
  console.log("Starting console log cleanup...\n");

  const totalResults = {
    filesProcessed: 0,
    filesModified: 0,
    totalRemoved: 0,
    errors: [],
  };

  for (const dir of directories) {
    const dirPath = path.join(__dirname, "..", dir);

    if (fs.existsSync(dirPath)) {
      console.log(`📁 Scanning directory: ${dir}`);
      const results = scanDirectory(dirPath);

      totalResults.filesProcessed += results.filesProcessed;
      totalResults.filesModified += results.filesModified;
      totalResults.totalRemoved += results.totalRemoved;
      totalResults.errors.push(...results.errors);

      console.log(`   Processed: ${results.filesProcessed} files`);
      console.log(`   Modified: ${results.filesModified} files`);
      console.log(`   Removed: ${results.totalRemoved} console statements\n`);
    } else {
      console.log(`⚠️  Directory not found: ${dir}\n`);
    }
  }

  // Summary
  console.log("📊 Cleanup Summary:");
  console.log("==================");
  console.log(`Total files processed: ${totalResults.filesProcessed}`);
  console.log(`Files modified: ${totalResults.filesModified}`);
  console.log(`Total console statements removed: ${totalResults.totalRemoved}`);

  if (totalResults.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${totalResults.errors.length}`);
    totalResults.errors.forEach((error) => {
      console.log(`   - ${error.file || error.directory}: ${error.error}`);
    });
  }

  console.log("\n🎉 Console log cleanup completed!");
  console.log("\n💡 Tips:");
  console.log("- Consider using a proper logging library for production");
  console.log("- Implement environment-based logging levels");
  console.log("- Add error tracking service for production monitoring");
}

main();
