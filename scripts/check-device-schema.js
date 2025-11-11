import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDeviceSchema() {
  try {
    console.log("🔍 Checking devices table schema...");

    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'devices'
      ORDER BY ordinal_position;
    `);

    console.log("📋 Devices table columns:");
    columns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (${
          col.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    // Count devices
    const countResult = await pool.query("SELECT COUNT(*) FROM devices");
    const deviceCount = parseInt(countResult.rows[0].count);

    console.log(`\n📊 Total devices: ${deviceCount}`);

    if (deviceCount > 0) {
      // Get sample devices with correct column names
      const devices = await pool.query(`
        SELECT * FROM devices LIMIT 3;
      `);

      console.log("\n✅ Sample device data:");
      devices.rows.forEach((device, index) => {
        console.log(`  Device ${index + 1}:`, device);
      });
    }
  } catch (error) {
    console.error("❌ Error checking device schema:", error.message);
  } finally {
    await pool.end();
  }
}

checkDeviceSchema();
