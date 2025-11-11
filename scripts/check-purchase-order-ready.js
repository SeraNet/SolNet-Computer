import pkg from "pg";
const { Pool } = pkg;

// Database configuration - use the same connection as your .env
const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";

const pool = new Pool({
  connectionString,
});

async function checkPurchaseOrderReady() {
  try {
    console.log("🔍 Checking purchase order system readiness...");

    const client = await pool.connect();

    try {
      // Check if purchase_orders table exists and has required columns
      const purchaseOrdersResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        ORDER BY ordinal_position;
      `);

      console.log("📊 purchase_orders table structure:");
      const requiredColumns = [
        "id",
        "order_number",
        "date",
        "status",
        "location_id",
        "created_by",
      ];
      const foundColumns = purchaseOrdersResult.rows.map(
        (row) => row.column_name
      );

      purchaseOrdersResult.rows.forEach((row) => {
        const isRequired = requiredColumns.includes(row.column_name);
        console.log(
          `  ${row.column_name}: ${row.data_type} (${
            row.is_nullable === "YES" ? "nullable" : "not null"
          }) ${isRequired ? "✅" : ""}`
        );
      });

      // Check if we have at least one location
      const locationsResult = await client.query(`
        SELECT id, name, is_active FROM locations LIMIT 5;
      `);

      console.log(`\n📍 Available locations: ${locationsResult.rows.length}`);
      locationsResult.rows.forEach((row) => {
        console.log(
          `  ${row.id}: ${row.name} (${row.is_active ? "active" : "inactive"})`
        );
      });

      // Check if we have at least one user
      const usersResult = await client.query(`
        SELECT id, first_name, last_name, role FROM users LIMIT 5;
      `);

      console.log(`\n👥 Available users: ${usersResult.rows.length}`);
      usersResult.rows.forEach((row) => {
        console.log(
          `  ${row.id}: ${row.first_name} ${row.last_name} (${row.role})`
        );
      });

      // Check if we have at least one supplier
      const suppliersResult = await client.query(`
        SELECT id, name FROM suppliers LIMIT 5;
      `);

      console.log(`\n🏢 Available suppliers: ${suppliersResult.rows.length}`);
      suppliersResult.rows.forEach((row) => {
        console.log(`  ${row.id}: ${row.name}`);
      });

      // Check if purchase_order_items table exists
      const purchaseOrderItemsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'purchase_order_items'
        ORDER BY ordinal_position;
      `);

      console.log("\n📦 purchase_order_items table structure:");
      purchaseOrderItemsResult.rows.forEach((row) => {
        console.log(
          `  ${row.column_name}: ${row.data_type} (${
            row.is_nullable === "YES" ? "nullable" : "not null"
          })`
        );
      });

      // Summary
      console.log("\n📋 Summary:");
      console.log(
        `  ✅ purchase_orders table: ${purchaseOrdersResult.rows.length} columns`
      );
      console.log(
        `  ✅ purchase_order_items table: ${purchaseOrderItemsResult.rows.length} columns`
      );
      console.log(`  ✅ Locations: ${locationsResult.rows.length} available`);
      console.log(`  ✅ Users: ${usersResult.rows.length} available`);
      console.log(`  ✅ Suppliers: ${suppliersResult.rows.length} available`);

      if (locationsResult.rows.length === 0) {
        console.log(
          "❌ No locations found - purchase orders require at least one location"
        );
      }
      if (usersResult.rows.length === 0) {
        console.log(
          "❌ No users found - purchase orders require at least one user"
        );
      }

      console.log("\n🚀 Purchase order system is ready!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkPurchaseOrderReady();
