import pkg from "pg";
const { Pool } = pkg;

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/solnetmanage";

const pool = new Pool({
  connectionString,
});

async function checkSchema() {
  try {
    console.log("🔍 Checking purchase order table schema...");

    const client = await pool.connect();

    try {
      // Check purchase_orders table structure
      const purchaseOrdersColumns = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        ORDER BY ordinal_position;
      `);

      purchaseOrdersColumns.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type}${
            row.character_maximum_length
              ? `(${row.character_maximum_length})`
              : ""
          } (${row.is_nullable === "YES" ? "nullable" : "not null"})${
            row.column_default ? ` default: ${row.column_default}` : ""
          }`
        );
      });

      // Check purchase_order_items table structure
      const purchaseOrderItemsColumns = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'purchase_order_items'
        ORDER BY ordinal_position;
      `);

      purchaseOrderItemsColumns.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type}${
            row.character_maximum_length
              ? `(${row.character_maximum_length})`
              : ""
          } (${row.is_nullable === "YES" ? "nullable" : "not null"})${
            row.column_default ? ` default: ${row.column_default}` : ""
          }`
        );
      });

      // Test a simple insert to see what error occurs
      try {
        const testResult = await client.query(`
          INSERT INTO purchase_orders (
            order_number, 
            date, 
            status, 
            location_id, 
            created_by, 
            total_items, 
            total_estimated_cost, 
            priority
          ) VALUES (
            'TEST-001',
            CURRENT_DATE,
            'draft',
            'test-location-id',
            'test-user-id',
            0,
            0.00,
            'normal'
          ) RETURNING id;
        `);

        // Clean up test data
        await client.query(
          `DELETE FROM purchase_orders WHERE order_number = 'TEST-001'`
        );
        console.log("🧹 Test data cleaned up");
      } catch (insertError) {
        console.error("Error details:", insertError);
      }
    } finally {
      client.release();
    }
  } catch (error) {
  } finally {
    await pool.end();
  }
}

checkSchema();
