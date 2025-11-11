import pkg from "pg";
const { Pool } = pkg;

// Database configuration - using the actual database URL from .env
const connectionString =
  "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";

const pool = new Pool({
  connectionString,
});

async function debugActivities() {
  try {
    console.log("🔍 Debugging recent activities...");

    const client = await pool.connect();

    try {
      // Check if tables exist and have data
      console.log("\n📊 Checking database tables...");

      // Check devices table
      const devicesCount = await client.query(`
        SELECT COUNT(*) as count FROM devices;
      `);
      console.log(`✅ Devices table: ${devicesCount.rows[0].count} records`);

      // Check customers table
      const customersCount = await client.query(`
        SELECT COUNT(*) as count FROM customers;
      `);
      console.log(
        `✅ Customers table: ${customersCount.rows[0].count} records`
      );

      // Check sales table
      const salesCount = await client.query(`
        SELECT COUNT(*) as count FROM sales;
      `);
      console.log(`✅ Sales table: ${salesCount.rows[0].count} records`);

      // Check notifications table
      const notificationsCount = await client.query(`
        SELECT COUNT(*) as count FROM notifications;
      `);
      console.log(
        `✅ Notifications table: ${notificationsCount.rows[0].count} records`
      );

      // Get recent devices
      console.log("\n📱 Recent devices (last 10):");
      const recentDevices = await client.query(`
        SELECT 
          d.id, 
          d.receipt_number, 
          c.name as customer_name,
          d.status,
          d.created_at,
          d.updated_at
        FROM devices d
        LEFT JOIN customers c ON d.customer_id = c.id
        ORDER BY d.created_at DESC
        LIMIT 10;
      `);

      if (recentDevices.rows.length > 0) {
        recentDevices.rows.forEach((device, index) => {
          console.log(
            `  ${index + 1}. Device #${device.receipt_number} - ${
              device.customer_name || "No customer"
            } - ${device.status} - Created: ${device.created_at}`
          );
        });
      } else {
        console.log("  ❌ No devices found");
      }

      // Get recent customers
      console.log("\n👥 Recent customers (last 5):");
      const recentCustomers = await client.query(`
        SELECT id, name, phone, created_at
        FROM customers
        ORDER BY created_at DESC
        LIMIT 5;
      `);

      if (recentCustomers.rows.length > 0) {
        recentCustomers.rows.forEach((customer, index) => {
          console.log(
            `  ${index + 1}. ${customer.name} - ${customer.phone} - Created: ${
              customer.created_at
            }`
          );
        });
      } else {
        console.log("  ❌ No customers found");
      }

      // Get recent sales
      console.log("\n💰 Recent sales (last 5):");
      const recentSales = await client.query(`
        SELECT 
          s.id, 
          s.total_amount,
          c.name as customer_name,
          s.created_at
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC
        LIMIT 5;
      `);

      if (recentSales.rows.length > 0) {
        recentSales.rows.forEach((sale, index) => {
          console.log(
            `  ${index + 1}. Sale ETB ${sale.total_amount} - ${
              sale.customer_name || "No customer"
            } - Created: ${sale.created_at}`
          );
        });
      } else {
        console.log("  ❌ No sales found");
      }

      // Test the exact query from the storage method
      console.log("\n🔍 Testing storage query logic...");

      // Test recent devices query
      const testDevices = await client.query(`
        SELECT 
          d.id, 
          d.receipt_number, 
          c.name as customer_name,
          d.status,
          d.created_at,
          d.updated_at
        FROM devices d
        LEFT JOIN customers c ON d.customer_id = c.id
        ORDER BY d.created_at DESC
        LIMIT 10;
      `);
      console.log(
        `✅ Recent devices query returned: ${testDevices.rows.length} results`
      );

      // Test recent customers query
      const testCustomers = await client.query(`
        SELECT id, name, phone, created_at
        FROM customers
        ORDER BY created_at DESC
        LIMIT 5;
      `);
      console.log(
        `✅ Recent customers query returned: ${testCustomers.rows.length} results`
      );

      // Test recent sales query
      const testSales = await client.query(`
        SELECT 
          s.id, 
          s.total_amount,
          c.name as customer_name,
          s.created_at
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC
        LIMIT 10;
      `);
      console.log(
        `✅ Recent sales query returned: ${testSales.rows.length} results`
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error debugging activities:", error.message);
  } finally {
    await pool.end();
  }
}

debugActivities();
