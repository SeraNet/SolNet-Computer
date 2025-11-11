import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixInventoryColumns() {
  const client = await pool.connect();

  try {

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../migrations/fix_inventory_items_columns.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Begin transaction
    await client.query("BEGIN");

    // Execute the migration
    await client.query(migrationSQL);

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ inventory_items table columns fixed successfully!");

    // Verify the table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      ORDER BY ordinal_position;
    `);

    result.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    // Check if we have data
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM inventory_items;
    `);

    console.log(
      `\n📦 Found ${countResult.rows[0].count} items in inventory_items table`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
fixInventoryColumns()
  .then(() => {
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });