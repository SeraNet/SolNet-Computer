import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function enhanceInventoryItems() {
  const client = await pool.connect();

  try {

    // Begin transaction
    await client.query("BEGIN");

    // Step 1: Add new columns to inventory_items table

    const newColumns = [
      "ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true",
      "ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
      "ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
      "ADD COLUMN IF NOT EXISTS image_url TEXT",
      "ADD COLUMN IF NOT EXISTS specifications JSONB",
      "ADD COLUMN IF NOT EXISTS compatibility JSONB",
      "ADD COLUMN IF NOT EXISTS warranty TEXT",
    ];

    for (const column of newColumns) {
      await client.query(`ALTER TABLE inventory_items ${column};`);
    }

    // Step 2: Migrate accessories data to inventory_items

    // First, check if accessories table exists
    const accessoriesExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'accessories'
      );
    `);

    if (accessoriesExists.rows[0].exists) {
      const accessoriesResult = await client.query("SELECT * FROM accessories");
      console.log(
        `Found ${accessoriesResult.rows.length} accessories to migrate`
      );

      for (const accessory of accessoriesResult.rows) {
        // Check if inventory item with same SKU exists
        const existingItem = await client.query(
          "SELECT id FROM inventory_items WHERE sku = $1",
          [accessory.sku]
        );

        if (existingItem.rows.length > 0) {
          // Update existing inventory item with accessory data
          await client.query(
            `
            UPDATE inventory_items 
            SET 
              is_public = $1,
              is_active = $2,
              sort_order = $3,
              image_url = $4,
              specifications = $5,
              compatibility = $6,
              warranty = $7,
              updated_at = NOW()
            WHERE sku = $8
          `,
            [
              accessory.is_public || true,
              accessory.is_active || true,
              accessory.sort_order || 0,
              accessory.image_url,
              accessory.specifications,
              accessory.compatibility,
              accessory.warranty,
              accessory.sku,
            ]
          );
        } else {
          // Create new inventory item from accessory data
          await client.query(
            `
            INSERT INTO inventory_items (
              id, name, sku, description, category, brand, model,
              purchase_price, sale_price, quantity, min_stock_level,
              reorder_point, reorder_quantity, is_public, is_active,
              sort_order, image_url, specifications, compatibility, warranty,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          `,
            [
              accessory.id,
              accessory.name,
              accessory.sku,
              accessory.description,
              accessory.category,
              accessory.brand,
              accessory.model,
              accessory.purchase_price,
              accessory.sale_price,
              accessory.quantity,
              accessory.min_stock_level,
              accessory.reorder_point,
              accessory.reorder_quantity,
              accessory.is_public || true,
              accessory.is_active || true,
              accessory.sort_order || 0,
              accessory.image_url,
              accessory.specifications,
              accessory.compatibility,
              accessory.warranty,
              accessory.created_at,
              accessory.updated_at,
            ]
          );
        }
      }
    } else {
    }

    // Step 3: Create new accessories table that references inventory_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS accessories_new (
        num_id SERIAL UNIQUE,
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_item_id VARCHAR NOT NULL REFERENCES inventory_items(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Step 4: Migrate existing accessories to new structure
    if (accessoriesExists.rows[0].exists) {
      const accessoriesResult = await client.query("SELECT * FROM accessories");

      for (const accessory of accessoriesResult.rows) {
        // Find the corresponding inventory item
        const inventoryItem = await client.query(
          "SELECT id FROM inventory_items WHERE sku = $1",
          [accessory.sku]
        );

        if (inventoryItem.rows.length > 0) {
          await client.query(
            `
            INSERT INTO accessories_new (id, inventory_item_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
          `,
            [
              accessory.id,
              inventoryItem.rows[0].id,
              accessory.created_at,
              accessory.updated_at,
            ]
          );
        }
      }
    }

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ Enhancement completed successfully!");
    console.log("\n📋 Summary of changes:");
    console.log("   - is_public (for public landing page display)");
    console.log("   - sort_order (for display ordering)");
    console.log("   - specifications (JSONB for technical specs)");
    console.log("   - warranty (for warranty information)");
    console.log("3. Created new accessories reference table");
    console.log(
      "1. Update your application code to use the enhanced inventory_items"
    );
    console.log(
      "3. Drop the old accessories table after confirming everything works:"
    );
    console.log("   - RENAME TABLE accessories_new TO accessories;");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Run enhancement if called directly
enhanceInventoryItems()
  .then(() => {
    console.log("🎉 Enhancement script completed");
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });

export { enhanceInventoryItems };