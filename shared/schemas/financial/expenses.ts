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
import { expenseStatusEnum } from "../enums";
import { users } from "../core/users";
import { locations } from "../core/locations";
import { customers } from "../core/customers";
import { devices } from "../devices/devices";

// Expense Categories table
export const expenseCategories = pgTable("expense_categories", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 20 }), // UI color for category
  icon: varchar("icon", { length: 50 }), // Icon name for category
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").references(() => locations.id),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  vendor: text("vendor"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"),
  expenseType: text("expense_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budgets table
export const budgets = pgTable("budgets", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => expenseCategories.id),
  locationId: varchar("location_id").references(() => locations.id),
  year: integer("year").notNull(),
  month: integer("month"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // monthly, quarterly, yearly
  expenseType: text("expense_type"),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Invoices table
export const loanInvoices = pgTable("loan_invoices", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .references(() => customers.id)
    .notNull(),
  deviceDescription: text("device_description").notNull(),
  serviceDescription: text("service_description").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  remainingAmount: decimal("remaining_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  // New fields for enhanced invoice types
  invoiceType: varchar("invoice_type").notNull().default("service"),
  itemType: varchar("item_type"),
  inventoryItemId: varchar("inventory_item_id"),
  quantity: integer("quantity"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  serviceTypeId: varchar("service_type_id"),
  deviceTypeId: varchar("device_type_id"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Invoice Payments table
export const loanInvoicePayments = pgTable("loan_invoice_payments", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id")
    .references(() => loanInvoices.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
  recordedBy: varchar("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertExpenseCategorySchema =
  createInsertSchema(expenseCategories);
export const selectExpenseCategorySchema =
  createSelectSchema(expenseCategories);
export const updateExpenseCategorySchema =
  insertExpenseCategorySchema.partial();

export const insertExpenseSchema = createInsertSchema(expenses);
export const selectExpenseSchema = createSelectSchema(expenses);
export const updateExpenseSchema = insertExpenseSchema.partial();

export const insertBudgetSchema = createInsertSchema(budgets);
export const selectBudgetSchema = createSelectSchema(budgets);
export const updateBudgetSchema = insertBudgetSchema.partial();

export const insertLoanInvoiceSchema = createInsertSchema(loanInvoices);
export const selectLoanInvoiceSchema = createSelectSchema(loanInvoices);
export const updateLoanInvoiceSchema = insertLoanInvoiceSchema.partial();

export const insertLoanInvoicePaymentSchema =
  createInsertSchema(loanInvoicePayments);
export const selectLoanInvoicePaymentSchema =
  createSelectSchema(loanInvoicePayments);
export const updateLoanInvoicePaymentSchema =
  insertLoanInvoicePaymentSchema.partial();

// Types
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;
export type UpdateExpenseCategory = z.infer<typeof updateExpenseCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
export type UpdateBudget = z.infer<typeof updateBudgetSchema>;

export type LoanInvoice = typeof loanInvoices.$inferSelect;
export type InsertLoanInvoice = typeof loanInvoices.$inferInsert;
export type UpdateLoanInvoice = z.infer<typeof updateLoanInvoiceSchema>;

export type LoanInvoicePayment = typeof loanInvoicePayments.$inferSelect;
export type InsertLoanInvoicePayment = typeof loanInvoicePayments.$inferInsert;
export type UpdateLoanInvoicePayment = z.infer<
  typeof updateLoanInvoicePaymentSchema
>;
