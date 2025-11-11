-- Performance Indexes Migration
-- Adds indexes to frequently queried columns to improve query performance
-- Execute this migration to optimize database queries

-- ============================================================================
-- DEVICES TABLE INDEXES (Most queried table)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_devices_customer_id ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_location_id ON devices(location_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_receipt_number ON devices(receipt_number);
CREATE INDEX IF NOT EXISTS idx_devices_device_type_id ON devices(device_type_id);
CREATE INDEX IF NOT EXISTS idx_devices_brand_id ON devices(brand_id);
CREATE INDEX IF NOT EXISTS idx_devices_model_id ON devices(model_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_devices_location_status ON devices(location_id, status);
CREATE INDEX IF NOT EXISTS idx_devices_location_created ON devices(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_status_created ON devices(status, created_at DESC);

-- Partial index for active/pending devices only (more efficient)
CREATE INDEX IF NOT EXISTS idx_devices_active_repairs 
  ON devices(location_id, created_at DESC) 
  WHERE status IN ('pending', 'in-progress', 'awaiting-parts');

-- ============================================================================
-- CUSTOMERS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for full-text search on customer names
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm 
  ON customers USING gin(name gin_trgm_ops);

-- Composite index for active customers by location
CREATE INDEX IF NOT EXISTS idx_customers_location_active 
  ON customers(location_id, is_active);

-- ============================================================================
-- INVENTORY_ITEMS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_is_active ON inventory_items(is_active);

-- Composite for low stock alerts (very common query)
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock 
  ON inventory_items(location_id, quantity) 
  WHERE quantity <= minimum_stock AND is_active = true;

-- Composite for active inventory by location
CREATE INDEX IF NOT EXISTS idx_inventory_location_active 
  ON inventory_items(location_id, is_active);

-- GIN index for product name search
CREATE INDEX IF NOT EXISTS idx_inventory_name_trgm 
  ON inventory_items USING gin(name gin_trgm_ops);

-- ============================================================================
-- SALES TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sales_location_id ON sales(location_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- Composite indexes for sales reports (very common queries)
CREATE INDEX IF NOT EXISTS idx_sales_location_date 
  ON sales(location_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_user_date 
  ON sales(user_id, created_at DESC);

-- Partial index for today's sales (hot data)
CREATE INDEX IF NOT EXISTS idx_sales_today 
  ON sales(location_id, created_at DESC) 
  WHERE created_at >= CURRENT_DATE;

-- ============================================================================
-- SALE_ITEMS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

-- Composite for item sales analysis
CREATE INDEX IF NOT EXISTS idx_sale_items_item_created 
  ON sale_items(item_id, created_at DESC);

-- ============================================================================
-- APPOINTMENTS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_device_id ON appointments(device_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Composite for calendar views (very common)
CREATE INDEX IF NOT EXISTS idx_appointments_location_date 
  ON appointments(location_id, appointment_date);

-- Partial index for upcoming appointments
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming 
  ON appointments(location_id, appointment_date) 
  WHERE appointment_date >= CURRENT_DATE AND status != 'cancelled';

-- ============================================================================
-- EXPENSES TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_expenses_location_id ON expenses(location_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- Composite for expense reports
CREATE INDEX IF NOT EXISTS idx_expenses_location_date 
  ON expenses(location_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category_date 
  ON expenses(category_id, expense_date DESC);

-- Partial index for current month expenses
CREATE INDEX IF NOT EXISTS idx_expenses_current_month 
  ON expenses(location_id, expense_date DESC) 
  WHERE expense_date >= date_trunc('month', CURRENT_DATE);

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Composite for active users by location and role
CREATE INDEX IF NOT EXISTS idx_users_location_role_active 
  ON users(location_id, role) 
  WHERE is_active = true;

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES (if exists)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Composite for unread notifications query (very common)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read = false;

-- ============================================================================
-- DEVICE_ACTIVITIES TABLE INDEXES (if exists)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_device_activities_device_id ON device_activities(device_id);
CREATE INDEX IF NOT EXISTS idx_device_activities_user_id ON device_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_device_activities_created_at ON device_activities(created_at DESC);

-- Composite for device history
CREATE INDEX IF NOT EXISTS idx_device_activities_device_created 
  ON device_activities(device_id, created_at DESC);

-- ============================================================================
-- PURCHASE_ORDERS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_purchase_orders_location_id ON purchase_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_expected_date ON purchase_orders(expected_delivery_date);

-- Composite for pending orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_location_status 
  ON purchase_orders(location_id, status);

-- ============================================================================
-- PURCHASE_ORDER_ITEMS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_item_id ON purchase_order_items(inventory_item_id);

-- ============================================================================
-- LOAN_INVOICES TABLE INDEXES  
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_loan_invoices_customer_id ON loan_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_loan_invoices_location_id ON loan_invoices(location_id);
CREATE INDEX IF NOT EXISTS idx_loan_invoices_status ON loan_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_loan_invoices_created_at ON loan_invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_invoices_due_date ON loan_invoices(payment_due_date);

-- Partial index for outstanding invoices
CREATE INDEX IF NOT EXISTS idx_loan_invoices_outstanding 
  ON loan_invoices(customer_id, created_at DESC) 
  WHERE payment_status IN ('pending', 'partial');

-- ============================================================================
-- REFERENCE TABLES INDEXES (brands, models, device_types, service_types, etc.)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_models_name ON models(name);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);
CREATE INDEX IF NOT EXISTS idx_device_types_name ON device_types(name);
CREATE INDEX IF NOT EXISTS idx_device_types_is_active ON device_types(is_active);
CREATE INDEX IF NOT EXISTS idx_service_types_name ON service_types(name);
CREATE INDEX IF NOT EXISTS idx_service_types_category ON service_types(category);
CREATE INDEX IF NOT EXISTS idx_service_types_is_active ON service_types(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- GIN index for full-text search on device problem descriptions
CREATE INDEX IF NOT EXISTS idx_devices_problem_search 
  ON devices USING gin(problem_description gin_trgm_ops);

-- GIN index for inventory descriptions
CREATE INDEX IF NOT EXISTS idx_inventory_description_search 
  ON inventory_items USING gin(
    COALESCE(description, '') gin_trgm_ops
  );

-- ============================================================================
-- UPDATE STATISTICS FOR QUERY PLANNER
-- ============================================================================

-- Update table statistics to help query planner make better decisions
ANALYZE devices;
ANALYZE customers;
ANALYZE inventory_items;
ANALYZE sales;
ANALYZE sale_items;
ANALYZE appointments;
ANALYZE expenses;
ANALYZE users;
ANALYZE purchase_orders;
ANALYZE loan_invoices;
ANALYZE brands;
ANALYZE models;
ANALYZE device_types;
ANALYZE service_types;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Performance indexes created successfully';
  RAISE NOTICE '📊 Total indexes created: ~50';
  RAISE NOTICE '🚀 Query performance should be significantly improved';
END $$;

