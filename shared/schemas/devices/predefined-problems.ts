import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  serial,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Predefined Problems table
export const predefinedProblems = pgTable("predefined_problems", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  severity: text("severity").notNull().default("medium"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertPredefinedProblemSchema =
  createInsertSchema(predefinedProblems);
export const selectPredefinedProblemSchema =
  createSelectSchema(predefinedProblems);
export const updatePredefinedProblemSchema =
  insertPredefinedProblemSchema.partial();

// Types
export type PredefinedProblem = typeof predefinedProblems.$inferSelect;
export type InsertPredefinedProblem = typeof predefinedProblems.$inferInsert;
export type UpdatePredefinedProblem = z.infer<
  typeof updatePredefinedProblemSchema
>;
