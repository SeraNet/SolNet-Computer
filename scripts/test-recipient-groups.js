import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testRecipientGroups() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('recipient_groups', 'recipient_group_members')
      ORDER BY table_name;
    `);
    

    // Test 2: Check default groups
    const groupsResult = await client.query(`
      SELECT id, name, description, created_at 
      FROM recipient_groups 
      ORDER BY created_at;
    `);
    
    groupsResult.rows.forEach(group => {
    });

    // Test 3: Check if customers table has data
    const customersResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM customers;
    `);
    

    // Test 4: Show first few customers
    const sampleCustomers = await client.query(`
      SELECT id, name, phone, email 
      FROM customers 
      LIMIT 5;
    `);
    
    sampleCustomers.rows.forEach(customer => {
    });

    console.log('\n🎯 Next steps:');
    console.log('2. Create a new group (e.g., "Muslim Customers")');
    console.log('4. Use the group in bulk SMS campaigns');

  } catch (error) {
  } finally {
    await client.end();
  }
}

testRecipientGroups();