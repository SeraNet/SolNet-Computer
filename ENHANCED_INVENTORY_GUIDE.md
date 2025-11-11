# Enhanced Inventory Items Guide

## Problem Statement

You currently have two separate database tables with duplicate data:

- **`accessories`** - Used for displaying items on the public landing page
- **`inventory_items`** - Used for POS sales and purchase orders

Both tables store essentially the same information, leading to data duplication and maintenance overhead.

## Solution: Enhanced Inventory Items Table

### Overview

Instead of creating a unified table, we're enhancing the existing `inventory_items` table with all the features from the `accessories` table. This approach:

1. **Keeps `inventory_items` as the single source of truth**
2. **Adds missing features from `accessories` to `inventory_items`**
3. **Maintains backward compatibility**
4. **Eliminates data duplication**

### Benefits

✅ **Single Source of Truth** - All product data in one table  
✅ **Automatic Stock Management** - When items are out of stock, they automatically won't show on public page  
✅ **Simplified Management** - One table to manage instead of two  
✅ **Consistent Data Structure** - All products follow the same schema  
✅ **Better Performance** - Fewer tables and relationships to manage  
✅ **Easier Reporting** - Unified queries across all products

### Database Schema Changes

#### Enhanced Inventory Items Table

The `inventory_items` table now includes all features from `accessories`:

```sql
-- New columns added to inventory_items table
ALTER TABLE inventory_items ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE inventory_items ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE inventory_items ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN image_url TEXT;
ALTER TABLE inventory_items ADD COLUMN specifications JSONB;
ALTER TABLE inventory_items ADD COLUMN compatibility JSONB;
ALTER TABLE inventory_items ADD COLUMN warranty TEXT;
```

#### Complete Enhanced Structure

```sql
CREATE TABLE inventory_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR REFERENCES locations(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'General',
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
  -- New fields for public display
  is_public BOOLEAN NOT NULL DEFAULT true, -- Show on public landing page
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- For ordering on public page
  image_url TEXT, -- URL or base64 image
  specifications JSONB, -- Technical specifications
  compatibility JSONB, -- Compatible devices/systems
  warranty TEXT, -- Warranty information
  last_restocked TIMESTAMP,
  predicted_stockout TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Migration Steps

### 1. Run the Enhancement Script

```bash
node scripts/enhance-inventory-items.js
```

This script will:

- Add new columns to the `inventory_items` table
- Migrate all accessories data to `inventory_items`
- Create a new accessories reference table
- Preserve all existing relationships

### 2. Update Application Code

#### Backend Changes (server/)

**Update storage.ts:**

```typescript
// Enhanced getInventoryItems to include public display features
async getInventoryItems(locationId?: string, includePublic?: boolean): Promise<InventoryItem[]> {
  let query = db.select().from(inventoryItems);

  if (locationId) {
    query = query.where(eq(inventoryItems.locationId, locationId));
  }

  if (includePublic) {
    query = query.where(and(
      eq(inventoryItems.isPublic, true),
      eq(inventoryItems.isActive, true)
    ));
  }

  return query.orderBy(inventoryItems.sortOrder);
}

// Get items for public landing page
async getPublicInventoryItems(): Promise<InventoryItem[]> {
  return db
    .select()
    .from(inventoryItems)
    .where(and(
      eq(inventoryItems.isPublic, true),
      eq(inventoryItems.isActive, true),
      gt(inventoryItems.quantity, 0) // Only show items in stock
    ))
    .orderBy(inventoryItems.sortOrder);
}

// Get accessories (for backward compatibility)
async getAccessories(): Promise<InventoryItem[]> {
  return this.getPublicInventoryItems();
}
```

**Update routes.ts:**

```typescript
// Enhanced inventory routes
app.get("/api/inventory", async (req, res) => {
  try {
    const { locationId, includePublic } = req.query;
    const inventory = await storage.getInventoryItems(
      locationId as string,
      includePublic === "true"
    );
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

// Public inventory items for landing page
app.get("/api/inventory/public", async (req, res) => {
  try {
    const publicItems = await storage.getPublicInventoryItems();
    res.json(publicItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch public inventory" });
  }
});

// Backward compatibility for accessories
app.get("/api/accessories", async (req, res) => {
  try {
    const accessories = await storage.getAccessories();
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch accessories" });
  }
});
```

#### Frontend Changes (client/)

**Update public-landing.tsx:**

```typescript
// Replace accessories query with public inventory items
const { data: accessories = [] } = useQuery<InventoryItem[]>({
  queryKey: ["inventory", "public"],
  queryFn: () => apiRequest("/api/inventory/public", "GET"),
});
```

**Update inventory-management.tsx:**

```typescript
// Enhanced inventory query
const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
  queryKey: ["inventory"],
  queryFn: () => apiRequest("/api/inventory", "GET"),
});

// Add form fields for new features
const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchasePrice: z.number().min(0, "Purchase price must be positive"),
  salePrice: z.number().min(0, "Sale price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  minStockLevel: z.number().min(0, "Minimum stock level must be positive"),
  // New fields
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  imageUrl: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  compatibility: z.array(z.string()).optional(),
  warranty: z.string().optional(),
});
```

**Update pos-modal.tsx:**

```typescript
// Enhanced inventory query for POS
const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
  queryKey: ["inventory", "pos"],
  queryFn: () => apiRequest("/api/inventory", "GET"),
});

// Filter only active items for POS
const availableItems = inventoryItems.filter(
  (item) => item.isActive && item.quantity > 0
);
```

### 3. Update Type Definitions

**Update types/inventory.ts:**

```typescript
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  purchasePrice?: number;
  salePrice: number;
  quantity: number;
  minStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  // New fields for public display
  isPublic: boolean;
  isActive: boolean;
  sortOrder?: number;
  imageUrl?: string;
  specifications?: Record<string, any>;
  compatibility?: string[];
  warranty?: string;
  // Existing fields
  locationId?: string;
  leadTimeDays?: number;
  avgDailySales?: number;
  supplier?: string;
  barcode?: string;
  lastRestocked?: Date;
  predictedStockout?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Examples

### Creating Inventory Items with Public Display Features

```typescript
// Create an item for both inventory and public display
const newItem = await storage.createInventoryItem({
  name: "USB-C to Lightning Cable",
  sku: "USB-C-LIGHTNING-001",
  category: "Cables",
  brand: "Apple",
  salePrice: 19.99,
  quantity: 50,
  // Public display features
  isPublic: true,
  isActive: true,
  sortOrder: 1,
  imageUrl: "https://example.com/cable-image.jpg",
  specifications: {
    length: "1 meter",
    connector: "USB-C to Lightning",
    powerDelivery: "18W",
  },
  compatibility: ["iPhone", "iPad", "MacBook"],
  warranty: "1 year manufacturer warranty",
});
```

### Querying Items for Different Purposes

```typescript
// Get all inventory items (for management)
const allItems = await storage.getInventoryItems();

// Get public items for landing page (only in-stock, public, active)
const publicItems = await storage.getPublicInventoryItems();

// Get items for POS (only active items)
const posItems = await storage.getInventoryItems(locationId, false);
```

### Automatic Stock Management

```typescript
// Items automatically won't show on public page when out of stock
const publicItems = await storage.getPublicInventoryItems();
// This only returns items where:
// - isPublic = true
// - isActive = true
// - quantity > 0
```

## Best Practices

1. **Set `isPublic = true`** for items you want to show on the landing page
2. **Set `isActive = true`** for items available for sale
3. **Use `sortOrder`** to control display order on public pages
4. **Set `quantity = 0`** to automatically hide items from public display
5. **Use `specifications` and `compatibility`** for detailed product information
6. **Include `warranty` information** for customer confidence

## Migration Benefits

### Before Migration

- ❌ Data duplication between accessories and inventory_items
- ❌ Manual updates required when stock changes
- ❌ Inconsistent data structures
- ❌ Complex relationships

### After Migration

- ✅ Single source of truth in inventory_items
- ✅ Automatic stock management (out of stock = not public)
- ✅ Consistent data structure
- ✅ Simplified relationships
- ✅ Enhanced features (images, specs, compatibility)

## Testing Checklist

- [ ] Public landing page displays inventory items correctly
- [ ] Out-of-stock items don't appear on public page
- [ ] POS system works with enhanced inventory items
- [ ] Inventory management shows all new fields
- [ ] Image upload and display works
- [ ] Specifications and compatibility data is saved/displayed
- [ ] Sort order works on public pages
- [ ] Backward compatibility maintained for existing accessories

## Rollback Plan

If issues arise:

1. **Database Rollback:**

   ```sql
   -- Remove new columns
   ALTER TABLE inventory_items DROP COLUMN is_public;
   ALTER TABLE inventory_items DROP COLUMN is_active;
   ALTER TABLE inventory_items DROP COLUMN sort_order;
   ALTER TABLE inventory_items DROP COLUMN image_url;
   ALTER TABLE inventory_items DROP COLUMN specifications;
   ALTER TABLE inventory_items DROP COLUMN compatibility;
   ALTER TABLE inventory_items DROP COLUMN warranty;
   ```

2. **Code Rollback:**
   - Revert to previous git commit
   - Restore original API endpoints
   - Update frontend queries back to original

This enhanced approach gives you the best of both worlds: simplified data management with enhanced functionality, while maintaining backward compatibility.
