import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateCustomerLocations() {
  try {
    console.log("🔍 Updating customer locations...");

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

    // Update customers that don't have a location assigned
    const updateResult = await pool.query(
      `
      UPDATE customers 
      SET location_id = $1, updated_at = NOW()
      WHERE location_id IS NULL;
    `,
      [defaultLocation.id]
    );

    console.log(
      `✅ Updated ${updateResult.rowCount} customers with location: ${defaultLocation.name}`
    );

    // Verify the update
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as total_customers,
             COUNT(location_id) as customers_with_location,
             COUNT(*) - COUNT(location_id) as customers_without_location
      FROM customers;
    `);

    const stats = verifyResult.rows[0];
    console.log("\n📊 Customer location statistics:");
    console.log(`  - Total customers: ${stats.total_customers}`);
    console.log(
      `  - Customers with location: ${stats.customers_with_location}`
    );
    console.log(
      `  - Customers without location: ${stats.customers_without_location}`
    );
  } catch (error) {
    console.error("❌ Error updating customer locations:", error.message);
  } finally {
    await pool.end();
  }
}

updateCustomerLocations();
