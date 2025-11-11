import pkg from "pg";
const { Pool } = pkg;

// Database configuration - using the actual database URL from .env
const connectionString = "postgresql://postgres:SolNet%40W71@localhost:5432/sc_db";

const pool = new Pool({
  connectionString,
});

async function testCustomerSearch() {
  try {
    console.log("🔍 Testing customer search functionality...");

    const client = await pool.connect();

    try {
      // Check if customers table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'customers'
        );
      `);

      if (!tableExists.rows[0].exists) {
        console.log("❌ customers table does not exist");
        return;
      }

      console.log("✅ customers table exists");

      // Check how many customers are in the database
      const customerCount = await client.query(`
        SELECT COUNT(*) as count FROM customers;
      `);

      console.log(`📊 Total customers in database: ${customerCount.rows[0].count}`);

      // Get sample customers
      const sampleCustomers = await client.query(`
        SELECT id, name, phone, email FROM customers LIMIT 5;
      `);

      console.log("👥 Sample customers:");
      sampleCustomers.rows.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.name} - ${customer.phone} - ${customer.email || 'No email'}`);
      });

      // Test search functionality
      if (sampleCustomers.rows.length > 0) {
        const testCustomer = sampleCustomers.rows[0];
        console.log(`\n🔍 Testing search for customer: ${testCustomer.name}`);
        
        // Test name search
        const nameSearch = await client.query(`
          SELECT id, name, phone, email 
          FROM customers 
          WHERE name ILIKE $1
        `, [`%${testCustomer.name}%`]);

        console.log(`✅ Name search found ${nameSearch.rows.length} customers`);

        // Test phone search
        const phoneSearch = await client.query(`
          SELECT id, name, phone, email 
          FROM customers 
          WHERE phone ILIKE $1
        `, [`%${testCustomer.phone}%`]);

        console.log(`✅ Phone search found ${phoneSearch.rows.length} customers`);

        // Test partial search
        const partialName = testCustomer.name.substring(0, 3);
        const partialSearch = await client.query(`
          SELECT id, name, phone, email 
          FROM customers 
          WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
        `, [`%${partialName}%`]);

        console.log(`✅ Partial search for "${partialName}" found ${partialSearch.rows.length} customers`);
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error testing customer search:", error.message);
  } finally {
    await pool.end();
  }
}

testCustomerSearch();
