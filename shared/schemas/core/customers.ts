import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { locations } from "./locations";

// Customers table
export const customers = pgTable("customers", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name"), // For backward compatibility
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("USA"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  emergencyContact: jsonb("emergency_contact"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  locationId: varchar("location_id").references(() => locations.id),
  registrationDate: date("registration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);
export const updateCustomerSchema = insertCustomerSchema.partial();

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
