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
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { smsStatusEnum } from "../enums";
import { users } from "../core/users";
import { customers } from "../core/customers";

// SMS Settings table
export const smsSettings = pgTable("sms_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ethiopian SMS Settings table
export const ethiopianSmsSettings = pgTable("ethiopian_sms_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // 'ethio_telecom', 'local_aggregator', 'custom'
  username: text("username"),
  password: text("password"),
  apiKey: text("api_key"),
  senderId: text("sender_id"),
  baseUrl: text("base_url"),
  customEndpoint: text("custom_endpoint"),
  customHeaders: text("custom_headers"), // JSON string
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS Templates table
export const smsTemplates = pgTable("sms_templates", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  message: text("message").notNull(),
  variables: jsonb("variables"), // Template variables
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS Campaigns table - Updated to fix TypeScript cache issues
export const smsCampaigns = pgTable("sms_campaigns", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Campaign name
  templateId: varchar("template_id").references(() => smsTemplates.id),
  scheduledDate: date("scheduled_date"),
  status: smsStatusEnum("status").notNull().default("pending"),
  targetGroup: text("target_group"),
  customFilters: jsonb("custom_filters"),
  message: text("message"),
  totalCount: integer("total_count").default(0),
  sentCount: integer("sent_count").default(0),
  sentAt: date("sent_at"),
  occasion: text("occasion"),
  customOccasion: text("custom_occasion"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMS Campaign Recipients table
export const smsCampaignRecipients = pgTable("sms_campaign_recipients", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => smsCampaigns.id),
  customerId: varchar("customer_id").references(() => customers.id),
  phoneNumber: text("phone_number").notNull(),
  status: smsStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recipient Groups table
export const recipientGroups = pgTable("recipient_groups", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipient Group Members table
export const recipientGroupMembers = pgTable("recipient_group_members", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").references(() => recipientGroups.id),
  customerId: varchar("customer_id").references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Messages table
export const customerMessages = pgTable("customer_messages", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  message: text("message").notNull(),
  subject: text("subject"),
  type: text("type").notNull(), // sms, email, call
  status: text("status").notNull().default("sent"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertSmsSettingsSchema = createInsertSchema(smsSettings);
export const selectSmsSettingsSchema = createSelectSchema(smsSettings);
export const updateSmsSettingsSchema = insertSmsSettingsSchema.partial();

export const insertEthiopianSmsSettingsSchema =
  createInsertSchema(ethiopianSmsSettings);
export const selectEthiopianSmsSettingsSchema =
  createSelectSchema(ethiopianSmsSettings);
export const updateEthiopianSmsSettingsSchema =
  insertEthiopianSmsSettingsSchema.partial();

export const insertSmsTemplateSchema = createInsertSchema(smsTemplates);
export const selectSmsTemplateSchema = createSelectSchema(smsTemplates);
export const updateSmsTemplateSchema = insertSmsTemplateSchema.partial();

export const insertSmsCampaignSchema = createInsertSchema(smsCampaigns);
export const selectSmsCampaignSchema = createSelectSchema(smsCampaigns);
export const updateSmsCampaignSchema = insertSmsCampaignSchema.partial();

export const insertSmsCampaignRecipientSchema = createInsertSchema(
  smsCampaignRecipients
);
export const selectSmsCampaignRecipientSchema = createSelectSchema(
  smsCampaignRecipients
);
export const updateSmsCampaignRecipientSchema =
  insertSmsCampaignRecipientSchema.partial();

export const insertRecipientGroupSchema = createInsertSchema(recipientGroups);
export const selectRecipientGroupSchema = createSelectSchema(recipientGroups);
export const updateRecipientGroupSchema = insertRecipientGroupSchema.partial();

export const insertRecipientGroupMemberSchema = createInsertSchema(
  recipientGroupMembers
);
export const selectRecipientGroupMemberSchema = createSelectSchema(
  recipientGroupMembers
);
export const updateRecipientGroupMemberSchema =
  insertRecipientGroupMemberSchema.partial();

export const insertCustomerMessageSchema = createInsertSchema(customerMessages);
export const selectCustomerMessageSchema = createSelectSchema(customerMessages);
export const updateCustomerMessageSchema =
  insertCustomerMessageSchema.partial();

// Types
export type SmsSettings = typeof smsSettings.$inferSelect;
export type InsertSmsSettings = typeof smsSettings.$inferInsert;
export type UpdateSmsSettings = z.infer<typeof updateSmsSettingsSchema>;

export type EthiopianSmsSettings = typeof ethiopianSmsSettings.$inferSelect;
export type InsertEthiopianSmsSettings =
  typeof ethiopianSmsSettings.$inferInsert;
export type UpdateEthiopianSmsSettings = z.infer<
  typeof updateEthiopianSmsSettingsSchema
>;

export type SmsTemplate = typeof smsTemplates.$inferSelect;
export type InsertSmsTemplate = typeof smsTemplates.$inferInsert;
export type UpdateSmsTemplate = z.infer<typeof updateSmsTemplateSchema>;

export type SmsCampaign = typeof smsCampaigns.$inferSelect;
export type InsertSmsCampaign = typeof smsCampaigns.$inferInsert;
export type UpdateSmsCampaign = z.infer<typeof updateSmsCampaignSchema>;

export type SmsCampaignRecipient = typeof smsCampaignRecipients.$inferSelect;
export type InsertSmsCampaignRecipient =
  typeof smsCampaignRecipients.$inferInsert;
export type UpdateSmsCampaignRecipient = z.infer<
  typeof updateSmsCampaignRecipientSchema
>;

export type RecipientGroup = typeof recipientGroups.$inferSelect;
export type InsertRecipientGroup = typeof recipientGroups.$inferInsert;
export type UpdateRecipientGroup = z.infer<typeof updateRecipientGroupSchema>;

export type RecipientGroupMember = typeof recipientGroupMembers.$inferSelect;
export type InsertRecipientGroupMember =
  typeof recipientGroupMembers.$inferInsert;
export type UpdateRecipientGroupMember = z.infer<
  typeof updateRecipientGroupMemberSchema
>;

export type CustomerMessage = typeof customerMessages.$inferSelect;
export type InsertCustomerMessage = typeof customerMessages.$inferInsert;
export type UpdateCustomerMessage = z.infer<typeof updateCustomerMessageSchema>;
