import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";

const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";
const pool = new Pool({ connectionString });

async function createExpenseCategories() {
  try {
    console.log("🔧 Creating expense categories table...");

    const client = await pool.connect();

    try {
      // Read the migration file
      const migrationPath = path.join(
        process.cwd(),
        "migrations",
        "create_expense_categories_table.sql"
      );
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      console.log("📄 Migration SQL:");
      console.log(migrationSQL);

      // Execute the migration
      await client.query(migrationSQL);

      console.log("✅ Expense categories table created successfully!");

      // Verify the table structure
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'expense_categories'
        ORDER BY ordinal_position
      `);

      console.log("📋 Expense categories table structure:");
      result.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type} (${
            row.is_nullable === "YES" ? "nullable" : "not null"
          })`
        );
      });

      // Check if categories were inserted
      const categoriesResult = await client.query(`
        SELECT name, description, color, icon, sort_order
        FROM expense_categories
        ORDER BY sort_order
      `);

      console.log("📋 Default expense categories:");
      categoriesResult.rows.forEach((cat) => {
        console.log(`  - ${cat.name}: ${cat.description} (${cat.color})`);
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

createExpenseCategories();
