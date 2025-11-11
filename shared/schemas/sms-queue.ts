import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * SMS Queue - Reliable SMS delivery with retry mechanism
 */
export const smsQueue = pgTable("sms_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }), // 'device_registration', 'status_update', etc.
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'sent', 'failed', 'cancelled'
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  lastAttemptAt: timestamp("last_attempt_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // { deviceId, receiptNumber, customerId, etc. }
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
});

export type SmsQueue = typeof smsQueue.$inferSelect;
export type InsertSmsQueue = typeof smsQueue.$inferInsert;

export const insertSmsQueueSchema = createInsertSchema(smsQueue);
export const selectSmsQueueSchema = createSelectSchema(smsQueue);

