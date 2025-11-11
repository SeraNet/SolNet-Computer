import { pgEnum } from "drizzle-orm/pg-core";

// Device and Service Enums
export const deviceStatusEnum = pgEnum("device_status", [
  "registered",
  "diagnosed",
  "in_progress",
  "waiting_parts",
  "completed",
  "ready_for_pickup",
  "delivered",
  "cancelled",
]);

export const priorityEnum = pgEnum("priority", ["normal", "high", "urgent"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "partial",
  "refunded",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

// User and Role Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "technician",
  "sales",
  "customer_service",
]);

// Notification Enums
export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "warning",
  "error",
  "success",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "unread",
  "read",
  "archived",
]);

// SMS and Communication Enums
export const smsStatusEnum = pgEnum("sms_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
  "cancelled",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "draft",
  "sent",
  "delivered",
  "read",
  "failed",
]);

// Financial Enums
export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
  "paid",
]);

export const budgetPeriodEnum = pgEnum("budget_period", [
  "monthly",
  "quarterly",
  "yearly",
]);

// Inventory Enums
export const inventoryStatusEnum = pgEnum("inventory_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "discontinued",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
