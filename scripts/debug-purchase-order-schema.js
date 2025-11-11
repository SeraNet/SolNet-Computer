import pkg from "pg";
const { Pool } = pkg;

// Database configuration
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/solnetmanage";

const pool = new Pool({
  connectionString,
});

async function debugPurchaseOrderSchema() {
  try {
    console.log("🔍 Debugging purchase order schema...");

    const client = await pool.connect();

    try {
      // Check if purchase_orders table exists
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
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = 'purchase_orders'
          ORDER BY ordinal_position;
        `);

        console.log("📊 purchase_orders table structure:");
        columnsResult.rows.forEach((row) => {
          console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${row.column_default ? `default: ${row.column_default}` : ''}`);
        });

        // Check if there are any existing records
        const countResult = await client.query(`
          SELECT COUNT(*) as count FROM purchase_orders;
        `);
        console.log(`📈 Total purchase orders: ${countResult.rows[0].count}`);

        // Check for any constraints
        const constraintsResult = await client.query(`
          SELECT constraint_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_name = 'purchase_orders';
        `);
        
        if (constraintsResult.rows.length > 0) {
          console.log("🔒 Constraints:");
          constraintsResult.rows.forEach((row) => {
            console.log(`  ${row.constraint_name}: ${row.constraint_type}`);
          });
        }

      } else {
        console.log("❌ purchase_orders table does not exist");
      }

      // Check purchase_order_items table
      const purchaseOrderItemsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'purchase_order_items'
        );
      `);

      if (purchaseOrderItemsResult.rows[0].exists) {
        console.log("\n✅ purchase_order_items table exists");

        // Check table structure
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = 'purchase_order_items'
          ORDER BY ordinal_position;
        `);

        console.log("📊 purchase_order_items table structure:");
        columnsResult.rows.forEach((row) => {
          console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${row.column_default ? `default: ${row.column_default}` : ''}`);
        });
      } else {
        console.log("❌ purchase_order_items table does not exist");
      }

      // Check suppliers table
      const suppliersResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'suppliers'
        );
      `);

      if (suppliersResult.rows[0].exists) {
        console.log("\n✅ suppliers table exists");
        
        // Check if there are any suppliers
        const suppliersCount = await client.query(`
          SELECT COUNT(*) as count FROM suppliers;
        `);
        console.log(`📈 Total suppliers: ${suppliersCount.rows[0].count}`);
        
        if (suppliersCount.rows[0].count > 0) {
          const suppliers = await client.query(`
            SELECT id, name FROM suppliers LIMIT 5;
          `);
          console.log("📋 Sample suppliers:");
          suppliers.rows.forEach((row) => {
            console.log(`  ${row.id}: ${row.name}`);
          });
        }
      } else {
        console.log("❌ suppliers table does not exist");
      }

      // Check locations table
      const locationsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'locations'
        );
      `);

      if (locationsResult.rows[0].exists) {
        console.log("\n✅ locations table exists");
        
        // Check if there are any locations
        const locationsCount = await client.query(`
          SELECT COUNT(*) as count FROM locations;
        `);
        console.log(`📈 Total locations: ${locationsCount.rows[0].count}`);
        
        if (locationsCount.rows[0].count > 0) {
          const locations = await client.query(`
            SELECT id, name, is_active FROM locations LIMIT 5;
          `);
          console.log("📋 Sample locations:");
          locations.rows.forEach((row) => {
            console.log(`  ${row.id}: ${row.name} (${row.is_active ? 'active' : 'inactive'})`);
          });
        }
      } else {
        console.log("❌ locations table does not exist");
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

debugPurchaseOrderSchema();
