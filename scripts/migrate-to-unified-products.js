const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateToUnifiedProducts() {
  const client = await pool.connect();

  try {

    // Begin transaction
    await client.query("BEGIN");

    // Step 1: Create the new products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        num_id SERIAL UNIQUE,
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        location_id VARCHAR REFERENCES locations(id),
        name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT DEFAULT 'General',
        type TEXT NOT NULL DEFAULT 'inventory',
        brand TEXT,
        model TEXT,
        purchase_price DECIMAL(10, 2),
        sale_price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER NOT NULL DEFAULT 10,
        reorder_point INTEGER NOT NULL DEFAULT 15,
        reorder_quantity INTEGER NOT NULL DEFAULT 50,
        lead_time_days INTEGER DEFAULT 7,
        avg_daily_sales DECIMAL(8, 2) DEFAULT 0,
        supplier TEXT,
        barcode TEXT,
        is_public BOOLEAN NOT NULL DEFAULT true,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        image_url TEXT,
        specifications JSONB,
        compatibility JSONB,
        warranty TEXT,
        last_restocked TIMESTAMP,
        predicted_stockout TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Step 2: Migrate accessories data
    const accessoriesResult = await client.query("SELECT * FROM accessories");
    for (const accessory of accessoriesResult.rows) {
      await client.query(
        `
        INSERT INTO products (
          id, name, sku, description, category, type, brand, model,
          purchase_price, sale_price, quantity, min_stock_level,
          reorder_point, reorder_quantity, is_public, is_active,
          sort_order, image_url, specifications, compatibility, warranty,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (sku) DO NOTHING
      `,
        [
          accessory.id,
          accessory.name,
          accessory.sku,
          accessory.description,
          accessory.category,
          "accessory", // Set type as accessory
          accessory.brand,
          accessory.model,
          accessory.purchase_price,
          accessory.sale_price,
          accessory.quantity,
          accessory.min_stock_level,
          accessory.reorder_point,
          accessory.reorder_quantity,
          accessory.is_public,
          accessory.is_active,
          accessory.sort_order,
          accessory.image_url,
          accessory.specifications,
          accessory.compatibility,
          accessory.warranty,
          accessory.created_at,
          accessory.updated_at,
        ]
      );
    }

    // Step 3: Migrate inventory items data
    const inventoryResult = await client.query("SELECT * FROM inventory_items");
    for (const item of inventoryResult.rows) {
      await client.query(
        `
        INSERT INTO products (
          id, location_id, name, sku, description, category, type, brand, model,
          purchase_price, sale_price, quantity, min_stock_level,
          reorder_point, reorder_quantity, lead_time_days, avg_daily_sales,
          supplier, barcode, is_public, is_active, sort_order, image_url,
          specifications, compatibility, warranty, last_restocked,
          predicted_stockout, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
        ON CONFLICT (sku) DO NOTHING
      `,
        [
          item.id,
          item.location_id,
          item.name,
          item.sku,
          item.description,
          item.category,
          "inventory", // Set type as inventory
          item.brand,
          item.model,
          item.purchase_price,
          item.sale_price,
          item.quantity,
          item.min_stock_level,
          item.reorder_point,
          item.reorder_quantity,
          item.lead_time_days,
          item.avg_daily_sales,
          item.supplier,
          item.barcode,
          true, // is_public
          item.is_active,
          0, // sort_order
          null, // image_url
          null, // specifications
          null, // compatibility
          null, // warranty
          item.last_restocked,
          item.predicted_stockout,
          item.created_at,
          item.updated_at,
        ]
      );
    }

    // Step 4: Update sale_items table to reference products
    await client.query(`
      ALTER TABLE sale_items 
      ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);
    `);

    // Update existing sale_items to reference products instead of inventory_items
    await client.query(`
      UPDATE sale_items 
      SET product_id = products.id 
      FROM products 
      WHERE sale_items.inventory_item_id = products.id;
    `);

    // Step 5: Update purchase_order_items table to reference products
    await client.query(`
      ALTER TABLE purchase_order_items 
      ADD COLUMN IF NOT EXISTS product_id VARCHAR REFERENCES products(id);
    `);

    // Update existing purchase_order_items to reference products instead of inventory_items
    await client.query(`
      UPDATE purchase_order_items 
      SET product_id = products.id 
      FROM products 
      WHERE purchase_order_items.inventory_item_id = products.id;
    `);

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Update your application code to use the new products table"
    );
    console.log("3. Drop the old tables after confirming everything works:");
    console.log("   - DROP TABLE inventory_items;");
    console.log(
      "4. Remove the old columns from sale_items and purchase_order_items"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToUnifiedProducts()
    .then(() => {
      console.log("🎉 Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = { migrateToUnifiedProducts };