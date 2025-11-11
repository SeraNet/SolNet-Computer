import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function updateExpensesTable() {
  try {
    console.log("🔧 Updating expenses table schema...");

    const client = await pool.connect();

    try {
      // Read the migration file
      const migrationPath = path.join(
        process.cwd(),
        "migrations",
        "update_expenses_table.sql"
      );
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      console.log("📄 Migration SQL:");
      console.log(migrationSQL);

      // Execute the migration
      await client.query(migrationSQL);

      console.log("✅ Expenses table updated successfully!");

      // Verify the table structure
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'expenses'
        ORDER BY ordinal_position
      `);

      console.log("📋 New expenses table structure:");
      result.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type} (${
            row.is_nullable === "YES" ? "nullable" : "not null"
          })`
        );
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}

updateExpensesTable();
