import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  date,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { deviceStatusEnum, priorityEnum } from "../enums";
import { customers } from "../core/customers";
import { users } from "../core/users";
import { locations } from "../core/locations";
import { predefinedProblems } from "./predefined-problems";

// Devices table
export const devices = pgTable("devices", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  locationId: varchar("location_id").references(() => locations.id),
  assignedTechnicianId: varchar("assigned_technician_id").references(
    () => users.id
  ),
  deviceType: text("device_type").notNull(),
  deviceTypeId: varchar("device_type_id"),
  brand: text("brand"),
  brandId: varchar("brand_id"),
  model: text("model"),
  modelId: varchar("model_id"),
  serialNumber: text("serial_number"),
  imei: text("imei"),
  color: text("color"),
  storage: text("storage"),
  operatingSystem: text("operating_system"),
  problemDescription: text("problem_description").notNull(),
  diagnosis: text("diagnosis"),
  repairNotes: text("repair_notes"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  status: deviceStatusEnum("status").notNull().default("registered"),
  paymentStatus: text("payment_status").default("pending"),
  priority: priorityEnum("priority").notNull().default("normal"),
  receiptNumber: text("receipt_number").notNull().unique(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  serviceTypeId: varchar("service_type_id"),
  warrantyExpiry: date("warranty_expiry"),
  estimatedCompletionDate: date("estimated_completion_date"),
  actualCompletionDate: date("actual_completion_date"),
  pickupDate: date("pickup_date"),
  deliveryDate: date("delivery_date"),
  feedbackRequested: boolean("feedback_requested").default(false),
  feedbackSubmitted: boolean("feedback_submitted").default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device Status History table
export const deviceStatusHistory = pgTable("device_status_history", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  status: deviceStatusEnum("status").notNull(),
  changedBy: varchar("changed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Device Problems table
export const deviceProblems = pgTable("device_problems", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  problemId: varchar("problem_id").references(() => predefinedProblems.id),
  description: text("description"),
  severity: text("severity").default("medium"),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Device Feedback table
export const deviceFeedback = pgTable("device_feedback", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  customerId: varchar("customer_id").references(() => customers.id),
  locationId: varchar("location_id").references(() => locations.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  comments: text("comments"), // Alternative field name
  serviceQuality: integer("service_quality"),
  communication: integer("communication"),
  timeliness: integer("timeliness"),
  valueForMoney: integer("value_for_money"),
  wouldRecommend: boolean("would_recommend").default(true),
  overallSatisfaction: integer("overall_satisfaction"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertDeviceSchema = createInsertSchema(devices);
export const selectDeviceSchema = createSelectSchema(devices);
export const updateDeviceSchema = insertDeviceSchema.partial();

export const insertDeviceStatusHistorySchema =
  createInsertSchema(deviceStatusHistory);
export const insertDeviceProblemSchema = createInsertSchema(deviceProblems);
export const insertDeviceFeedbackSchema = createInsertSchema(deviceFeedback);

// Types
export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;
export type UpdateDevice = z.infer<typeof updateDeviceSchema>;

export type DeviceStatusHistory = typeof deviceStatusHistory.$inferSelect;
export type InsertDeviceStatusHistory = typeof deviceStatusHistory.$inferInsert;

export type DeviceProblem = typeof deviceProblems.$inferSelect;
export type InsertDeviceProblem = typeof deviceProblems.$inferInsert;

export type DeviceFeedback = typeof deviceFeedback.$inferSelect;
export type InsertDeviceFeedback = typeof deviceFeedback.$inferInsert;
