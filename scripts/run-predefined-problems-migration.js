import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log("🚀 Starting predefined problems migration...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../migrations/create_predefined_problems.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    await pool.query(migrationSQL);

    console.log("✅ Predefined problems migration completed successfully!");

    // Verify the tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('predefined_problems', 'device_problems')
    `);

    console.log(
      "📋 Created tables:",
      tablesResult.rows.map((row) => row.table_name)
    );

    // Check how many predefined problems were inserted
    const problemsCount = await pool.query(
      "SELECT COUNT(*) FROM predefined_problems"
    );
    console.log(
      `📝 Inserted ${problemsCount.rows[0].count} predefined problems`
    );
  } catch (error) {
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();