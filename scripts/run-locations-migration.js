import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";

const pool = new Pool({
  connectionString,
});

async function runLocationsMigration() {
  try {
    console.log("🚀 Starting locations migration...");

    // Run table creation migration
    console.log("📋 Creating locations table...");
    const createTablePath = path.resolve(
      __dirname,
      "../migrations/create_locations_table.sql"
    );
    const createTableSQL = fs.readFileSync(createTablePath, "utf8");

    const client = await pool.connect();
    try {
      await client.query(createTableSQL);
      console.log("✅ Locations table created successfully!");

      // Run data seeding migration
      console.log("🌱 Seeding locations data...");
      const seedDataPath = path.resolve(
        __dirname,
        "../migrations/seed_locations_data.sql"
      );
      const seedDataSQL = fs.readFileSync(seedDataPath, "utf8");

      await client.query(seedDataSQL);
      console.log("✅ Locations data seeded successfully!");

      // Verify the migration
      const result = await client.query(
        "SELECT COUNT(*) as count FROM locations WHERE code = 'MAIN'"
      );
      const count = parseInt(result.rows[0].count);

      if (count > 0) {
        console.log(
          "✅ Migration verification successful - Main location found!"
        );
      } else {
        console.log("⚠️  Warning: Main location not found after migration");
      }
    } finally {
      client.release();
    }

    console.log("🎉 Locations migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.code === "42710") {
      console.log("ℹ️  Table already exists, continuing with data seeding...");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runLocationsMigration();
