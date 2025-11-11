import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Locations table for multi-location support
export const locations = pgTable("locations", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(), // Short code like "NYC01", "LA02"
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").notNull().default("USA"),
  phone: varchar("phone"),
  email: varchar("email"),
  managerName: varchar("manager_name"),
  isActive: boolean("is_active").notNull().default(true),
  timezone: varchar("timezone").default("America/New_York"),
  businessHours: jsonb("business_hours"), // Store hours as JSON
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertLocationSchema = createInsertSchema(locations);
export const selectLocationSchema = createSelectSchema(locations);
export const updateLocationSchema = insertLocationSchema.partial();

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;
