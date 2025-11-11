# Unified Products Migration Guide

## Problem Statement

You currently have two separate database tables with duplicate data:

- **`accessories`** - Used for displaying items on the public landing page
- **`inventory_items`** - Used for POS sales and purchase orders

Both tables store essentially the same information (name, SKU, description, prices, quantity, etc.), leading to data duplication and maintenance overhead.

## Solution: Unified Products Table

### Overview

We've created a unified `products` table that consolidates both tables with a `type` field to distinguish between different product categories:

- `type = 'accessory'` - Items for public display (formerly accessories)
- `type = 'inventory'` - Items for POS sales (formerly inventory_items)
- `type = 'equipment'` - Future category for tools/equipment

### Benefits

1. **Eliminates Data Duplication** - Single source of truth for all products
2. **Simplified Management** - One table to manage instead of two
3. **Consistent Data Structure** - All products follow the same schema
4. **Flexible Categorization** - Easy to add new product types
5. **Better Performance** - Fewer tables and relationships to manage
6. **Easier Reporting** - Unified queries across all product types

### Database Schema Changes

#### New Products Table Structure

```sql
CREATE TABLE products (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR REFERENCES locations(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'General',
  type TEXT NOT NULL DEFAULT 'inventory', -- 'accessory', 'inventory', 'equipment'
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
```

#### Updated Relationships

- `sale_items.product_id` → `products.id` (was `inventory_item_id`)
- `purchase_order_items.product_id` → `products.id` (was `inventory_item_id`)

## Migration Steps

### 1. Run the Migration Script

```bash
node scripts/migrate-to-unified-products.js
```

This script will:

- Create the new `products` table
- Migrate all accessories data with `type = 'accessory'`
- Migrate all inventory items data with `type = 'inventory'`
- Update foreign key references in related tables

### 2. Update Application Code

#### Backend Changes (server/)

**Update storage.ts:**

```typescript
// Replace getAccessories() with:
async getProducts(type?: string, locationId?: string): Promise<Product[]> {
  const query = db.select().from(products);

  if (type) {
    query.where(eq(products.type, type));
  }

  if (locationId) {
    query.where(eq(products.locationId, locationId));
  }

  return query;
}

// Replace getInventoryItems() with:
async getInventoryItems(locationId?: string): Promise<Product[]> {
  return this.getProducts('inventory', locationId);
}

// Replace getPublicAccessories() with:
async getPublicAccessories(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(
      eq(products.type, 'accessory'),
      eq(products.isPublic, true),
      eq(products.isActive, true)
    ))
    .orderBy(products.sortOrder);
}
```

**Update routes.ts:**

```typescript
// Replace accessories routes with:
app.get("/api/products", async (req, res) => {
  try {
    const { type, locationId } = req.query;
    const products = await storage.getProducts(
      type as string,
      locationId as string
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/accessories", async (req, res) => {
  try {
    const accessories = await storage.getProducts("accessory");
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch accessories" });
  }
});

app.get("/api/products/inventory", async (req, res) => {
  try {
    const inventory = await storage.getProducts("inventory", req.locationId);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});
```

#### Frontend Changes (client/)

**Update public-landing.tsx:**

```typescript
// Replace accessories query with:
const { data: accessories = [] } = useQuery<Product[]>({
  queryKey: ["products", "accessories"],
  queryFn: () => apiRequest("/api/products/accessories", "GET"),
});
```

**Update inventory-management.tsx:**

```typescript
// Replace inventoryItems query with:
const { data: inventoryItems = [] } = useQuery<Product[]>({
  queryKey: ["products", "inventory"],
  queryFn: () => apiRequest("/api/products/inventory", "GET"),
});
```

**Update pos-modal.tsx:**

```typescript
// Replace inventoryItems query with:
const { data: inventoryItems = [] } = useQuery<Product[]>({
  queryKey: ["products", "inventory"],
  queryFn: () => apiRequest("/api/products/inventory", "GET"),
});
```

### 3. Update Type Definitions

**Update types/inventory.ts:**

```typescript
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  type: "accessory" | "inventory" | "equipment";
  brand?: string;
  model?: string;
  purchasePrice?: number;
  salePrice: number;
  quantity: number;
  minStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  isPublic: boolean;
  isActive: boolean;
  sortOrder?: number;
  imageUrl?: string;
  // ... other fields
}
```

### 4. Clean Up Old Tables (After Testing)

```sql
-- Only run after confirming everything works
DROP TABLE accessories;
DROP TABLE inventory_items;

-- Remove old columns from related tables
ALTER TABLE sale_items DROP COLUMN inventory_item_id;
ALTER TABLE purchase_order_items DROP COLUMN inventory_item_id;
```

## Usage Examples

### Querying Products by Type

```typescript
// Get all accessories for public display
const accessories = await storage.getProducts("accessory");

// Get all inventory items for POS
const inventory = await storage.getProducts("inventory");

// Get all products regardless of type
const allProducts = await storage.getProducts();
```

### Creating New Products

```typescript
// Create an accessory
const newAccessory = await storage.createProduct({
  name: "USB Cable",
  sku: "USB-CABLE-001",
  type: "accessory",
  category: "Cables",
  salePrice: 9.99,
  isPublic: true,
  // ... other fields
});

// Create an inventory item
const newInventory = await storage.createProduct({
  name: "Laptop Charger",
  sku: "CHARGER-001",
  type: "inventory",
  category: "Power Supplies",
  salePrice: 29.99,
  locationId: "location-123",
  // ... other fields
});
```

## Best Practices

1. **Always specify the `type` field** when creating products
2. **Use the `isPublic` field** to control visibility on the landing page
3. **Set appropriate `sortOrder`** for accessories to control display order
4. **Use `locationId`** for inventory items that are location-specific
5. **Leverage the `category` field** for better organization within each type

## Rollback Plan

If issues arise during migration:

1. **Database Rollback:**

   ```sql
   -- Restore old tables from backup
   -- Drop the new products table
   DROP TABLE products;
   ```

2. **Code Rollback:**
   - Revert to previous git commit
   - Restore old API endpoints
   - Update frontend queries back to original

## Testing Checklist

- [ ] Public landing page displays accessories correctly
- [ ] POS system can sell inventory items
- [ ] Purchase orders work with new product references
- [ ] Inventory management shows correct data
- [ ] All CRUD operations work for both product types
- [ ] Search functionality works across all products
- [ ] Reports and analytics still function correctly

## Support

If you encounter any issues during migration:

1. Check the migration script logs for errors
2. Verify database constraints and foreign keys
3. Test with a small dataset first
4. Ensure all API endpoints are updated consistently
5. Check browser console for frontend errors

This unified approach will significantly simplify your data management while maintaining all existing functionality.
