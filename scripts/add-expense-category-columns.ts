import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Migration script to add color and icon columns to expense_categories table
 * Run with: npx tsx scripts/add-expense-category-columns.ts
 */

async function runMigration() {
  console.log('🔧 Adding color and icon columns to expense_categories table...\n');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    try {
      // Read and execute the migration file
      const migrationPath = path.join(__dirname, '..', 'migrations', 'add_expense_category_columns.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      await client.query(migrationSQL);
      
      console.log('✅ Migration completed successfully!');
      console.log('📊 Columns added: color, icon');
      console.log('🎨 Default values applied to existing categories\n');
      
      // Verify the columns were added
      const result = await client.query(`
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'expense_categories' 
        AND column_name IN ('color', 'icon')
        ORDER BY column_name;
      `);
      
      if (result.rows.length === 2) {
        console.log('✅ Verification: Columns exist in database');
        console.table(result.rows);
      }
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Note: If the expense_categories table doesn\'t exist yet,');
      console.log('   run the main database migrations first: npm run db:migrate');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

