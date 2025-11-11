import pkg from "pg";
const { Client } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createCustomerCategories() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Read the SQL migration file
    const sqlPath = path.join(
      __dirname,
      "../migrations/create_customer_categories_table.sql"
    );
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    console.log("📝 Executing customer categories migration...");
    await client.query(sqlContent);
    console.log("✅ Customer categories migration completed successfully");

    // Verify the table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'customer_categories'
    `);

    if (result.rows.length > 0) {

      // Check if the columns were added to customers table
      const customerColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name IN ('religion', 'location', 'device_types', 'tags', 'age', 'occupation', 'total_spent')
      `);

      console.log(
        `✅ Found ${customerColumns.rows.length} new columns in customers table:`,
        customerColumns.rows.map((row) => row.column_name)
      );

      // Check if default categories were inserted
      const categories = await client.query(`
        SELECT name FROM customer_categories
      `);

      console.log(
        `✅ Found ${categories.rows.length} customer categories:`,
        categories.rows.map((row) => row.name)
      );
    } else {
      console.log("❌ customer_categories table was not created");
    }
  } catch (error) {
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
createCustomerCategories()
  .then(() => {
    console.log("🎉 Customer categories migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });