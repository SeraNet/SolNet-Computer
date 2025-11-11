// Export all schemas from the modular structure
export * from "./enums";
export * from "./core";
export * from "./devices";
export * from "./sales";
export * from "./inventory";
export * from "./financial";
export * from "./communication";
export * from "./sms-queue";

// Ensure all commonly used schemas are exported
export {
  insertCustomerMessageSchema,
  insertSmsTemplateSchema,
  insertRecipientGroupSchema,
} from "./communication/sms";

export {
  insertSupplierSchema,
  insertCategorySchema,
  insertPurchaseOrderSchema,
} from "./inventory/inventory-items";

export { insertPredefinedProblemSchema } from "./devices/predefined-problems";

// Additional schemas that might be needed
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// System Settings table
export const systemSettings = pgTable("system_settings", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").default("general"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Feedback table
export const customerFeedback = pgTable("customer_feedback", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id"), // Will be set up with relations later
  deviceId: varchar("device_id"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  serviceType: text("service_type"),
  locationId: varchar("location_id"),
  rating: integer("rating").notNull(),
  reviewTitle: text("review_title"),
  comment: text("review_text"),
  wouldRecommend: boolean("would_recommend").default(true),
  serviceQuality: integer("service_quality"),
  communication: integer("communication"),
  speedOfService: integer("speed_of_service"),
  pricing: integer("pricing"),
  isPublic: boolean("is_public").default(true),
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accessories table (for backward compatibility) - now references inventory_items
export const accessories = pgTable("accessories", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category"),
  image: text("image"),
  inventoryItemId: varchar("inventory_item_id"), // Reference to inventory items
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for additional tables
export const insertSystemSettingSchema = createInsertSchema(systemSettings);
export const selectSystemSettingSchema = createSelectSchema(systemSettings);
export const updateSystemSettingSchema = insertSystemSettingSchema.partial();

export const insertCustomerFeedbackSchema =
  createInsertSchema(customerFeedback);
export const selectCustomerFeedbackSchema =
  createSelectSchema(customerFeedback);
export const updateCustomerFeedbackSchema =
  insertCustomerFeedbackSchema.partial();

export const insertAccessorySchema = createInsertSchema(accessories);
export const selectAccessorySchema = createSelectSchema(accessories);
export const updateAccessorySchema = insertAccessorySchema.partial();

// Types for additional tables
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type UpdateSystemSetting = z.infer<typeof updateSystemSettingSchema>;

export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type InsertCustomerFeedback = typeof customerFeedback.$inferInsert;
export type UpdateCustomerFeedback = z.infer<
  typeof updateCustomerFeedbackSchema
>;

export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = typeof accessories.$inferInsert;
export type UpdateAccessory = z.infer<typeof updateAccessorySchema>;

// Feedback schema for validation
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  wouldRecommend: z.boolean().default(true),
});
