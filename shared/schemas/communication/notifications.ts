import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationTypeEnum, notificationStatusEnum } from "../enums";
import { users } from "../core/users";

// Notification Types table
export const notificationTypes = pgTable("notification_types", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").default("general").notNull(),
  type: notificationTypeEnum("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Templates table
export const notificationTemplates = pgTable("notification_templates", {
  // Updated schema
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  typeId: varchar("type_id").references(() => notificationTypes.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  variables: jsonb("variables"), // Template variables like {customerName}, {deviceId}
  deviceRegistration: boolean("device_registration").default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").references(() => users.id),
  senderId: varchar("sender_id").references(() => users.id),
  typeId: varchar("type_id").references(() => notificationTypes.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").notNull().default("unread"),
  priority: text("priority").default("normal").notNull(),
  data: jsonb("data"), // Additional data for the notification
  readAt: timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertNotificationTypeSchema =
  createInsertSchema(notificationTypes);
export const selectNotificationTypeSchema =
  createSelectSchema(notificationTypes);
export const updateNotificationTypeSchema =
  insertNotificationTypeSchema.partial();

export const insertNotificationTemplateSchema = createInsertSchema(
  notificationTemplates
);
export const selectNotificationTemplateSchema = createSelectSchema(
  notificationTemplates
);
export const updateNotificationTemplateSchema =
  insertNotificationTemplateSchema.partial();

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export const updateNotificationSchema = insertNotificationSchema.partial();

// Types
export type NotificationType = typeof notificationTypes.$inferSelect;
export type InsertNotificationType = typeof notificationTypes.$inferInsert;
export type UpdateNotificationType = z.infer<
  typeof updateNotificationTypeSchema
>;

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate =
  typeof notificationTemplates.$inferInsert;
export type UpdateNotificationTemplate = z.infer<
  typeof updateNotificationTemplateSchema
>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

// Notification Preferences (for backward compatibility)
export const notificationPreferences = pgTable("notification_preferences", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  typeId: varchar("type_id").references(() => notificationTypes.id),
  enabled: boolean("enabled").notNull().default(true),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferenceSchema = createInsertSchema(
  notificationPreferences
);
export const selectNotificationPreferenceSchema = createSelectSchema(
  notificationPreferences
);
export const updateNotificationPreferenceSchema =
  insertNotificationPreferenceSchema.partial();

export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference =
  typeof notificationPreferences.$inferInsert;
export type UpdateNotificationPreference = z.infer<
  typeof updateNotificationPreferenceSchema
>;
