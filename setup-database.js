#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🗄️  SolNetManage Database Setup");
console.log("================================\n");

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.log("❌ No .env file found!");
  console.log(
    "\n📝 Please create a .env file with your database configuration."
  );
  console.log("   You can copy from env.template and modify as needed.\n");

  console.log("🔧 Quick Setup Options:");
  console.log("   1. Use Docker (recommended for development):");
  console.log("      docker-compose up -d");
  console.log(
    "      Then use: DATABASE_URL=postgresql://solnetuser:solnetpass@localhost:5432/solnetmanage"
  );
  console.log("\n   2. Use Supabase (free cloud database):");
  console.log("      - Go to https://supabase.com");
  console.log("      - Create a new project");
  console.log("      - Copy the connection string from Settings > Database");
  console.log("\n   3. Use Neon (free cloud database):");
  console.log("      - Go to https://neon.tech");
  console.log("      - Create a new project");
  console.log("      - Copy the connection string");
  console.log("\n   4. Install PostgreSQL locally");
  console.log("      - Download from https://postgresql.org/download/");
  console.log("      - Create database: solnetmanage");
  console.log(
    "      - Use: DATABASE_URL=postgresql://username:password@localhost:5432/solnetmanage"
  );

  process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, "utf8");
if (
  !envContent.includes("DATABASE_URL=") ||
  envContent.includes("DATABASE_URL=mock")
) {
  console.log("❌ DATABASE_URL not properly configured in .env file!");
  console.log("   Please set a valid PostgreSQL connection string.");
  process.exit(1);
}

console.log("✅ .env file found and DATABASE_URL is configured");
console.log("\n🚀 Next steps:");
console.log(
  "   1. Start your database (if using Docker: docker-compose up -d)"
);
console.log("   2. Run migrations: npm run db:migrate");
console.log("   3. Seed the database: npm run db:seed");
console.log("   4. Start the server: npm run dev");
console.log("\n📚 For more help, check the README or run: npm run db:help");
