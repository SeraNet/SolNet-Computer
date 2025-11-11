import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCustomers() {
  try {
    console.log('🔍 Checking customers in database...');
    
    // Check if customers table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Customers table does not exist!');
      return;
    }
    
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Customers table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Count customers
    const countResult = await pool.query('SELECT COUNT(*) FROM customers');
    const customerCount = parseInt(countResult.rows[0].count);
    
    console.log(`\n📊 Total customers: ${customerCount}`);
    
    if (customerCount > 0) {
      // Get sample customers
      const customers = await pool.query(`
        SELECT id, name, email, phone, address, notes, registration_date, location_id, created_at
        FROM customers
        ORDER BY created_at DESC
        LIMIT 10;
      `);
      
      console.log('\n✅ Sample customers:');
      customers.rows.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.name} (${customer.email}) - Phone: ${customer.phone}`);
        console.log(`     Location: ${customer.location_id || 'N/A'}`);
        console.log(`     Registered: ${customer.registration_date || customer.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No customers found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error checking customers:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomers();
