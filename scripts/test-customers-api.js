import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testCustomersAPI() {
  try {
    console.log("🧪 Testing customers API with location filtering...");

    // First, let's get a user and their location
    const userResult = await pool.query(`
      SELECT u.id, u.username, u.role, u.location_id, l.name as location_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.is_active = true
      LIMIT 1;
    `);

    if (userResult.rows.length === 0) {
      console.log("❌ No active users found");
      return;
    }

    const user = userResult.rows[0];
    console.log(`👤 Testing with user: ${user.username} (${user.role})`);
    console.log(
      `📍 User location: ${user.location_name || "None"} (${
        user.location_id || "None"
      })`
    );

    // Test the getCustomers method directly
    console.log("\n🔍 Testing getCustomers method...");

    // Test 1: All locations
    console.log("\n📋 Test 1: All locations (includeAllLocations: true)");
    const allCustomersResult = await pool.query(`
      SELECT id, name, email, phone, location_id
      FROM customers
      ORDER BY name;
    `);
    console.log(`Found ${allCustomersResult.rows.length} customers:`);
    allCustomersResult.rows.forEach((customer) => {
      console.log(
        `  - ${customer.name} (${customer.phone}) - Location: ${
          customer.location_id || "None"
        }`
      );
    });

    // Test 2: Specific location
    if (user.location_id) {
      console.log("\n📋 Test 2: Specific location filtering");
      const locationCustomersResult = await pool.query(
        `
        SELECT id, name, email, phone, location_id
        FROM customers
        WHERE location_id = $1 OR location_id IS NULL
        ORDER BY name;
      `,
        [user.location_id]
      );
      console.log(
        `Found ${locationCustomersResult.rows.length} customers for location ${user.location_id}:`
      );
      locationCustomersResult.rows.forEach((customer) => {
        console.log(
          `  - ${customer.name} (${customer.phone}) - Location: ${
            customer.location_id || "None"
          }`
        );
      });
    }

    // Test 3: No location assigned
    console.log("\n📋 Test 3: Customers with no location assigned");
    const noLocationCustomersResult = await pool.query(`
      SELECT id, name, email, phone, location_id
      FROM customers
      WHERE location_id IS NULL
      ORDER BY name;
    `);
    console.log(
      `Found ${noLocationCustomersResult.rows.length} customers with no location:`
    );
    noLocationCustomersResult.rows.forEach((customer) => {
      console.log(`  - ${customer.name} (${customer.phone})`);
    });

    console.log("\n✅ API testing completed!");
  } catch (error) {
    console.error("❌ Error testing customers API:", error.message);
  } finally {
    await pool.end();
  }
}

testCustomersAPI();
