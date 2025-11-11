import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateUserLocations() {
  try {
    console.log("🔍 Updating user locations...");

    // Get the first available location
    const locationsResult = await pool.query(`
      SELECT id, name FROM locations 
      WHERE is_active = true 
      ORDER BY created_at ASC 
      LIMIT 1;
    `);

    if (locationsResult.rows.length === 0) {
      console.log(
        "❌ No active locations found. Please create a location first."
      );
      return;
    }

    const defaultLocation = locationsResult.rows[0];
    console.log(
      `📍 Using default location: ${defaultLocation.name} (${defaultLocation.id})`
    );

    // Update users that don't have a location assigned
    const updateResult = await pool.query(
      `
      UPDATE users 
      SET location_id = $1, updated_at = NOW()
      WHERE location_id IS NULL;
    `,
      [defaultLocation.id]
    );

    console.log(
      `✅ Updated ${updateResult.rowCount} users with location: ${defaultLocation.name}`
    );

    // Verify the update
    const verifyResult = await pool.query(`
      SELECT u.username, u.role, u.location_id, l.name as location_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.is_active = true
      ORDER BY u.username;
    `);

    console.log("\n📊 User location assignments:");
    verifyResult.rows.forEach((user) => {
      console.log(
        `  - ${user.username} (${user.role}): ${
          user.location_name || "No location"
        } (${user.location_id || "None"})`
      );
    });
  } catch (error) {
    console.error("❌ Error updating user locations:", error.message);
  } finally {
    await pool.end();
  }
}

updateUserLocations();
