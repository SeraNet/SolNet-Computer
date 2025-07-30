import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const deviceStatusEnum = pgEnum("device_status", [
  "registered",
  "diagnosed",
  "in_progress", 
  "waiting_parts",
  "completed",
  "ready_for_pickup",
  "delivered",
  "cancelled"
]);

export const priorityEnum = pgEnum("priority", ["normal", "high", "urgent"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "partial",
  "refunded"
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed", 
  "in_progress",
  "completed",
  "cancelled"
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "technician", "sales"]);

// Locations table for multi-location support
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: userRoleEnum("role").notNull().default("sales"),
  locationId: varchar("location_id").references(() => locations.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device types, brands, models for reference
export const deviceTypes = pgTable("device_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const models = pgTable("models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brandId: varchar("brand_id").references(() => brands.id),
  deviceTypeId: varchar("device_type_id").references(() => deviceTypes.id),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service types
export const serviceTypes = pgTable("service_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Devices (for repair tracking)
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  locationId: varchar("location_id").references(() => locations.id),
  deviceTypeId: varchar("device_type_id").references(() => deviceTypes.id),
  brandId: varchar("brand_id").references(() => brands.id),
  modelId: varchar("model_id").references(() => models.id),
  serialNumber: text("serial_number"),
  problemDescription: text("problem_description").notNull(),
  serviceTypeId: varchar("service_type_id").references(() => serviceTypes.id),
  status: deviceStatusEnum("status").notNull().default("registered"),
  priority: priorityEnum("priority").notNull().default("normal"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  technicianNotes: text("technician_notes"),
  customerNotes: text("customer_notes"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  createdBy: varchar("created_by").references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory items
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").references(() => locations.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  category: text("category"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  reorderPoint: integer("reorder_point").notNull().default(15),
  reorderQuantity: integer("reorder_quantity").notNull().default(50),
  leadTimeDays: integer("lead_time_days").default(7),
  avgDailySales: decimal("avg_daily_sales", { precision: 8, scale: 2 }).default("0"),
  supplier: text("supplier"),
  barcode: text("barcode"),
  isActive: boolean("is_active").notNull().default(true),
  lastRestocked: timestamp("last_restocked"),
  predictedStockout: timestamp("predicted_stockout"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales transactions
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  locationId: varchar("location_id").references(() => locations.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: text("payment_method"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("paid"),
  notes: text("notes"),
  salesPersonId: varchar("sales_person_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sale items
export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => sales.id).notNull(),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  locationId: varchar("location_id").references(() => locations.id),
  title: text("title").notNull(),
  description: text("description"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(60), // in minutes
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device status history
export const deviceStatusHistory = pgTable("device_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id).notNull(),
  oldStatus: deviceStatusEnum("old_status"),
  newStatus: deviceStatusEnum("new_status").notNull(),
  notes: text("notes"),
  changedBy: varchar("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow(),
});

// Relations
export const locationsRelations = relations(locations, ({ many }) => ({
  users: many(users),
  devices: many(devices),
  inventoryItems: many(inventoryItems),
  sales: many(sales),
  appointments: many(appointments),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  devices: many(devices),
  sales: many(sales),
  appointments: many(appointments),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [devices.customerId],
    references: [customers.id],
  }),
  location: one(locations, {
    fields: [devices.locationId],
    references: [locations.id],
  }),
  deviceType: one(deviceTypes, {
    fields: [devices.deviceTypeId],
    references: [deviceTypes.id],
  }),
  brand: one(brands, {
    fields: [devices.brandId],
    references: [brands.id],
  }),
  model: one(models, {
    fields: [devices.modelId],
    references: [models.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [devices.serviceTypeId],
    references: [serviceTypes.id],
  }),
  createdByUser: one(users, {
    fields: [devices.createdBy],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [devices.assignedTo],
    references: [users.id],
  }),
  statusHistory: many(deviceStatusHistory),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  salesPerson: one(users, {
    fields: [sales.salesPersonId],
    references: [users.id],
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [saleItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  assignedToUser: one(users, {
    fields: [appointments.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [appointments.createdBy],
    references: [users.id],
  }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  models: many(models),
  devices: many(devices),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  brand: one(brands, {
    fields: [models.brandId],
    references: [brands.id],
  }),
  deviceType: one(deviceTypes, {
    fields: [models.deviceTypeId],
    references: [deviceTypes.id],
  }),
  devices: many(devices),
}));

// Insert schemas
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
  saleId: true, // saleId is added by the backend during creation
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceTypeSchema = createInsertSchema(deviceTypes).omit({
  id: true,
  createdAt: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  createdAt: true,
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
  createdAt: true,
});

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type DeviceType = typeof deviceTypes.$inferSelect;
export type InsertDeviceType = z.infer<typeof insertDeviceTypeSchema>;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;

// Smart inventory prediction types
export type InventoryPrediction = {
  itemId: string;
  currentStock: number;
  predictedStockout: Date | null;
  daysUntilStockout: number;
  suggestedReorderQuantity: number;
  avgDailySales: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
};

export type StockAlert = {
  id: string;
  itemId: string;
  itemName: string;
  alertType: 'low_stock' | 'predicted_stockout' | 'reorder_required';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  acknowledged: boolean;
};
