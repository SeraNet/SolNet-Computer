# Database Migration Guide

## Overview

This guide explains the database migration process and fixes that have been applied to ensure all tables and columns are properly synchronized between the schema definition and the actual database.

## Issues Found and Fixed

### 1. Purchase Orders Table Inconsistencies

**Problem**: The `purchase_orders` table in the schema was missing several important fields that were defined in the migration files.

**Fields Added**:

- `num_id` (SERIAL UNIQUE) - Auto-incrementing numeric ID
- `supplier_id` (VARCHAR) - Foreign key reference to suppliers table
- `location_id` (VARCHAR NOT NULL) - Foreign key reference to locations table
- `created_by` (VARCHAR NOT NULL) - Foreign key reference to users table
- `expected_delivery_date` (DATE) - Expected delivery date for the order

### 2. Purchase Order Items Table Inconsistencies

**Problem**: The `purchase_order_items` table was missing fields that were in the migrations.

**Fields Added**:

- `num_id` (SERIAL UNIQUE) - Auto-incrementing numeric ID
- `inventory_item_id` (VARCHAR) - Foreign key reference to inventory_items table
- `item_name` (TEXT NOT NULL) - Name of the item being ordered
- `created_at` (TIMESTAMP) - Creation timestamp

### 3. Missing Relations

**Problem**: The purchase orders tables were missing proper Drizzle relations.

**Added Relations**:

- `purchaseOrdersRelations` - Links purchase orders to suppliers, locations, users, and items
- `purchaseOrderItemsRelations` - Links items to purchase orders and inventory items

### 4. Schema Validation

**Verified**: All other tables and columns are properly defined:

- ✅ `customers.registration_date` - Date when customer first attended the shop
- ✅ `devices.receipt_number` - Unique receipt number for device tracking
- ✅ `customers.phone` - Unique constraint on phone numbers
- ✅ `business_profile` revenue targets - Monthly, annual, and growth targets

## Migration Process

### Option 1: Automated Migration (Recommended)

Run the comprehensive migration script:

```bash
npm run db:migrate
```

This script will:

1. Fix schema inconsistencies
2. Generate new Drizzle migrations
3. Push schema changes to database
4. Verify all tables and columns exist

### Option 2: Manual Migration

If you prefer to run migrations manually:

1. **Run the schema fix migration**:

   ```bash
   node scripts/run-migration.js migrations/fix_schema_inconsistencies.sql
   ```

2. **Generate new Drizzle migration**:

   ```bash
   npx drizzle-kit generate
   ```

3. **Push schema changes**:

   ```bash
   npm run db:push
   ```

4. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## Database Structure Verification

After migration, all **29 tables** should exist with their required columns:

### Core Business Tables (9)

- `locations` - Business locations
- `users` - System users (admin, technician, sales)
- `business_profile` - Business profile with revenue targets
- `customers` - Customer information with registration dates
- `devices` - Device repair tracking with receipt numbers
- `inventory_items` - Stock inventory management
- `sales` - Sales transactions
- `sale_items` - Individual sale line items
- `appointments` - Customer appointments

### Reference Tables (6)

- `device_types` - Device type definitions
- `brands` - Brand information
- `models` - Model information
- `service_types` - Service type definitions
- `accessories` - Accessory inventory
- `categories` - Category management

### Feedback & Communication Tables (3)

- `device_feedback` - Device-specific feedback
- `customer_messages` - Customer inquiries
- `customer_feedback` - Customer reviews and feedback

### Tracking & History Tables (2)

- `device_status_history` - Device status change tracking
- `warranties` - Warranty tracking

### Financial & Business Management Tables (8)

- `expense_categories` - Expense categorization
- `expenses` - Business expenses
- `loan_invoices` - Loan invoice management
- `loan_invoice_payments` - Loan payment tracking
- `promotions` - Marketing promotions
- `suppliers` - Supplier information
- `purchase_orders` - Purchase order management
- `purchase_order_items` - Purchase order line items

### System Tables (1)

- `system_settings` - System configuration and settings

## Troubleshooting

### Common Issues

1. **"Table already exists" errors**: These are normal if the table already exists. The migration uses `IF NOT EXISTS` clauses.

2. **"Column already exists" errors**: These are normal if the column already exists. The migration uses `IF NOT EXISTS` clauses.

3. **Foreign key constraint errors**: Make sure referenced tables exist before running migrations.

### Verification Commands

Check if a table exists:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'table_name'
);
```

Check if a column exists:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'table_name'
  AND column_name = 'column_name'
);
```

## Next Steps

After successful migration:

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Test functionality**:

   - Create a new customer
   - Add a device for repair
   - Create a purchase order
   - Test the receipt number tracking

3. **Monitor for issues**:
   - Check server logs for any database errors
   - Verify all API endpoints work correctly
   - Test data import/export functionality

## Support

If you encounter any issues during migration:

1. Check the server logs for detailed error messages
2. Verify your `DATABASE_URL` is correctly configured
3. Ensure your database user has sufficient permissions
4. Check that all required tables exist before running migrations

For additional help, refer to the project documentation or create an issue in the repository.
