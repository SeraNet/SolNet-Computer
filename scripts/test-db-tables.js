import pkg from "pg";
const { Pool } = pkg;

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/solnetmanage";

const pool = new Pool({
  connectionString,
});

async function testTables() {
  try {
    console.log("🔍 Testing database tables...");

    const client = await pool.connect();

    try {
      // Test if purchase_orders table exists
      const purchaseOrdersResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'purchase_orders'
        );
      `);

      if (purchaseOrdersResult.rows[0].exists) {
        console.log("✅ purchase_orders table exists");

        // Check table structure
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'purchase_orders'
          ORDER BY ordinal_position;
        `);

        console.log("📊 purchase_orders table structure:");
        columnsResult.rows.forEach((row) => {});
      } else {
        console.log("❌ purchase_orders table does not exist");
      }

      // Test if purchase_order_items table exists
      const purchaseOrderItemsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'purchase_order_items'
        );
      `);

      if (purchaseOrderItemsResult.rows[0].exists) {
        console.log("✅ purchase_order_items table exists");

        // Check table structure
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'purchase_order_items'
          ORDER BY ordinal_position;
        `);

        console.log("📊 purchase_order_items table structure:");
        columnsResult.rows.forEach((row) => {});
      } else {
        console.log("❌ purchase_order_items table does not exist");
      }

      // Test if suppliers table exists
      const suppliersResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'suppliers'
        );
      `);

      if (suppliersResult.rows[0].exists) {
        console.log("✅ suppliers table exists");

        // Check if there are any suppliers
        const suppliersCount = await client.query(`
          SELECT COUNT(*) as count FROM suppliers;
        `);
      } else {
        console.log("❌ suppliers table does not exist");
      }
    } finally {
      client.release();
    }
  } catch (error) {
  } finally {
    await pool.end();
  }
}

testTables();
