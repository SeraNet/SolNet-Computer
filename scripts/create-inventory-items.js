const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createInventoryItemsTable() {
  const client = await pool.connect();

  try {

    // Read the migration file
    const fs = require("fs");
    const path = require("path");
    const migrationPath = path.join(__dirname, "../migrations/create_inventory_items_table.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Begin transaction
    await client.query("BEGIN");

    // Execute the migration
    await client.query(migrationSQL);

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ inventory_items table created successfully!");
    
    // Verify the table was created
    const result = await client.query(`
      SELECT COUNT(*) as count FROM inventory_items;
    `);
    

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
createInventoryItemsTable()
  .then(() => {
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });