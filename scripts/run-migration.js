import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";

const connectionString = "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function runMigration() {
  try {
    console.log("🔧 Running migration: add_total_quantity_to_purchase_orders");
    
    const client = await pool.connect();
    
    try {
      // Read the migration file
      const migrationPath = path.join(process.cwd(), "migrations", "add_total_quantity_to_purchase_orders.sql");
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");
      
      console.log("📄 Migration SQL:");
      console.log(migrationSQL);
      
      // Execute the migration
      await client.query(migrationSQL);
      
      console.log("✅ Migration completed successfully!");
      
      // Verify the column was added
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        AND column_name = 'total_quantity'
      `);
      
      if (result.rows.length > 0) {
        console.log("✅ total_quantity column verified:", result.rows[0]);
      } else {
        console.log("❌ total_quantity column not found");
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
