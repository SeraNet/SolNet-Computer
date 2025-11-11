import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  date,
  time,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { appointmentStatusEnum } from "../enums";
import { customers } from "../core/customers";
import { users } from "../core/users";
import { locations } from "../core/locations";

// Appointments table
export const appointments = pgTable("appointments", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .references(() => customers.id)
    .notNull(),
  locationId: varchar("location_id").references(() => locations.id),
  title: text("title").notNull(),
  description: text("description"),
  appointmentDate: date("appointment_date").notNull(),
  duration: integer("duration").notNull().default(60), // in minutes
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);
export const updateAppointmentSchema = insertAppointmentSchema.partial();

// Types
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
