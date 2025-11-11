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
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Device Types table
export const deviceTypes = pgTable("device_types", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brands table
export const brands = pgTable("brands", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Models table
export const models = pgTable("models", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brandId: varchar("brand_id").references(() => brands.id),
  deviceTypeId: varchar("device_type_id").references(() => deviceTypes.id),
  description: text("description"),
  specifications: jsonb("specifications"),
  releaseYear: integer("release_year"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Types table
export const serviceTypes = pgTable("service_types", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // in minutes
  isPublic: boolean("is_public").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  features: jsonb("features"),
  requirements: jsonb("requirements"),
  warranty: text("warranty"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertDeviceTypeSchema = createInsertSchema(deviceTypes);
export const selectDeviceTypeSchema = createSelectSchema(deviceTypes);
export const updateDeviceTypeSchema = insertDeviceTypeSchema.partial();

export const insertBrandSchema = createInsertSchema(brands);
export const selectBrandSchema = createSelectSchema(brands);
export const updateBrandSchema = insertBrandSchema.partial();

export const insertModelSchema = createInsertSchema(models);
export const selectModelSchema = createSelectSchema(models);
export const updateModelSchema = insertModelSchema.partial();

export const insertServiceTypeSchema = createInsertSchema(serviceTypes);
export const selectServiceTypeSchema = createSelectSchema(serviceTypes);
export const updateServiceTypeSchema = insertServiceTypeSchema.partial();

// Types
export type DeviceType = typeof deviceTypes.$inferSelect;
export type InsertDeviceType = typeof deviceTypes.$inferInsert;
export type UpdateDeviceType = z.infer<typeof updateDeviceTypeSchema>;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;
export type UpdateBrand = z.infer<typeof updateBrandSchema>;

export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;
export type UpdateModel = z.infer<typeof updateModelSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = typeof serviceTypes.$inferInsert;
export type UpdateServiceType = z.infer<typeof updateServiceTypeSchema>;
