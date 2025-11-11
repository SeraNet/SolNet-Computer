import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkLocations() {
  try {
    console.log("🔍 Checking locations in database...");

    // Check if locations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'locations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ Locations table does not exist!");
      return;
    }

    // Count locations
    const countResult = await pool.query("SELECT COUNT(*) FROM locations");
    const locationCount = parseInt(countResult.rows[0].count);

    console.log(`📊 Total locations: ${locationCount}`);

    if (locationCount > 0) {
      // Get all locations
      const locations = await pool.query(`
        SELECT id, name, code, city, state, country, is_active, created_at
        FROM locations
        ORDER BY created_at ASC;
      `);

      console.log("\n✅ Available locations:");
      locations.rows.forEach((location, index) => {
        console.log(`  ${index + 1}. ${location.name} (${location.code})`);
        console.log(
          `     City: ${location.city}, State: ${
            location.state || "N/A"
          }, Country: ${location.country}`
        );
        console.log(`     Active: ${location.is_active ? "Yes" : "No"}`);
        console.log(`     ID: ${location.id}`);
        console.log("");
      });
    } else {
      console.log("❌ No locations found in the database");
      console.log("💡 You may need to run the location seeding script first.");
    }
  } catch (error) {
    console.error("❌ Error checking locations:", error.message);
  } finally {
    await pool.end();
  }
}

checkLocations();
