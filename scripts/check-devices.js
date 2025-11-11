import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDevices() {
  try {
    console.log("🔍 Checking devices in database...");

    // Check if devices table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'devices'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ Devices table does not exist!");
      return;
    }

    // Count devices
    const countResult = await pool.query("SELECT COUNT(*) FROM devices");
    const deviceCount = parseInt(countResult.rows[0].count);

    console.log(`📊 Total devices: ${deviceCount}`);

    if (deviceCount > 0) {
      // Get sample devices
      const devices = await pool.query(`
        SELECT d.id, d.device_type, d.brand, d.model, d.customer_id, d.location_id, d.status, d.created_at,
               c.name as customer_name, l.name as location_name
        FROM devices d
        LEFT JOIN customers c ON d.customer_id = c.id
        LEFT JOIN locations l ON d.location_id = l.id
        ORDER BY d.created_at DESC
        LIMIT 10;
      `);

      console.log("\n✅ Sample devices:");
      devices.rows.forEach((device, index) => {
        console.log(
          `  ${index + 1}. ${device.device_type} - ${device.brand} ${
            device.model
          }`
        );
        console.log(`     Customer: ${device.customer_name || "N/A"}`);
        console.log(
          `     Location: ${device.location_name || "None"} (${
            device.location_id || "None"
          })`
        );
        console.log(`     Status: ${device.status}`);
        console.log("");
      });

      // Check location statistics
      const locationStats = await pool.query(`
        SELECT COUNT(*) as total_devices,
               COUNT(location_id) as devices_with_location,
               COUNT(*) - COUNT(location_id) as devices_without_location
        FROM devices;
      `);

      const stats = locationStats.rows[0];
      console.log("📊 Device location statistics:");
      console.log(`  - Total devices: ${stats.total_devices}`);
      console.log(`  - Devices with location: ${stats.devices_with_location}`);
      console.log(
        `  - Devices without location: ${stats.devices_without_location}`
      );
    } else {
      console.log("❌ No devices found in the database");
    }
  } catch (error) {
    console.error("❌ Error checking devices:", error.message);
  } finally {
    await pool.end();
  }
}

checkDevices();
