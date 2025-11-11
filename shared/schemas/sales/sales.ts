import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, serial, date, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { paymentStatusEnum } from "../enums";
import { customers } from "../core/customers";
import { users } from "../core/users";
import { locations } from "../core/locations";
import { inventoryItems } from "../inventory/inventory-items";

// Sales table
export const sales = pgTable("sales", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  salesPersonId: varchar("sales_person_id").references(() => users.id),
  locationId: varchar("location_id").references(() => locations.id),
  saleDate: date("sale_date").notNull().default(sql`CURRENT_DATE`),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sale Items table
export const saleItems = pgTable("sale_items", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => sales.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertSaleSchema = createInsertSchema(sales);
export const selectSaleSchema = createSelectSchema(sales);
export const updateSaleSchema = insertSaleSchema.partial();

export const insertSaleItemSchema = createInsertSchema(saleItems);
export const selectSaleItemSchema = createSelectSchema(saleItems);
export const updateSaleItemSchema = insertSaleItemSchema.partial();

// Types
export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;
export type UpdateSale = z.infer<typeof updateSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;
export type UpdateSaleItem = z.infer<typeof updateSaleItemSchema>;
