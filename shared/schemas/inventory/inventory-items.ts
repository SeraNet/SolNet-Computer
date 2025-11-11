import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  integer,
  decimal,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { locations } from "../core/locations";
import { users } from "../core/users";
import { priorityEnum } from "../enums";

// Enhanced Inventory items with all features from accessories
export const inventoryItems = pgTable("inventory_items", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").references(() => locations.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  category: text("category").default("General"),
  brand: text("brand"),
  model: text("model"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  reorderPoint: integer("reorder_point").notNull().default(15),
  reorderQuantity: integer("reorder_quantity").notNull().default(50),
  leadTimeDays: integer("lead_time_days").default(7),
  avgDailySales: decimal("avg_daily_sales", { precision: 8, scale: 2 }).default(
    "0"
  ),
  supplier: text("supplier"),
  barcode: text("barcode"),
  // New fields from accessories for public display
  isPublic: boolean("is_public").notNull().default(true), // Show on public landing page
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0), // For ordering on public page
  imageUrl: text("image_url"), // URL or base64 image
  specifications: jsonb("specifications"), // Technical specifications
  compatibility: jsonb("compatibility"), // Compatible devices/systems
  warranty: text("warranty"), // Warranty information
  lastRestocked: timestamp("last_restocked"),
  predictedStockout: timestamp("predicted_stockout"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // Required field for category type
  description: text("description"),
  category: text("category"), // Additional category field
  parentCategoryId: varchar("parent_category_id"), // Will be set up with relations later
  createdBy: varchar("created_by"), // For tracking who created the category
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("USA"),
  website: text("website"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  date: date("date").notNull(),
  status: varchar("status").notNull().default("draft"), // draft, submitted, approved, received, cancelled
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  locationId: varchar("location_id")
    .references(() => locations.id)
    .notNull(),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  totalItems: integer("total_items").notNull().default(0),
  totalQuantity: integer("total_quantity").notNull().default(0),
  totalEstimatedCost: decimal("total_estimated_cost", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  notes: text("notes"),
  priority: priorityEnum("priority").notNull().default("normal"), // normal, high, urgent
  expectedDeliveryDate: date("expected_delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Order Items table
export const purchaseOrderItems = pgTable("purchase_order_items", {
  // Updated schema
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").references(
    () => purchaseOrders.id
  ),
  inventoryItemId: varchar("inventory_item_id").references(
    () => inventoryItems.id
  ),
  name: text("name"),
  sku: varchar("sku"),
  category: varchar("category"),
  description: text("description"),
  currentStock: integer("current_stock").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  suggestedQuantity: integer("suggested_quantity").default(1),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  priority: varchar("priority").default("normal"),
  notes: text("notes"),
  isExistingItem: boolean("is_existing_item").default(true),
  itemName: text("item_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertInventoryItemSchema = createInsertSchema(inventoryItems);
export const selectInventoryItemSchema = createSelectSchema(inventoryItems);
export const updateInventoryItemSchema = insertInventoryItemSchema.partial();

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export const updateCategorySchema = insertCategorySchema.partial();

export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);
export const updateSupplierSchema = insertSupplierSchema.partial();

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders);
export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);
export const updatePurchaseOrderSchema = insertPurchaseOrderSchema.partial();

export const insertPurchaseOrderItemSchema =
  createInsertSchema(purchaseOrderItems);
export const selectPurchaseOrderItemSchema =
  createSelectSchema(purchaseOrderItems);
export const updatePurchaseOrderItemSchema =
  insertPurchaseOrderItemSchema.partial();

// Types
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;
export type UpdateInventoryItem = z.infer<typeof updateInventoryItemSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type UpdatePurchaseOrder = z.infer<typeof updatePurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export type UpdatePurchaseOrderItem = z.infer<
  typeof updatePurchaseOrderItemSchema
>;
