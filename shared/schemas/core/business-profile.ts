import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  decimal,
  date,
  timestamp,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Business owner profile table
export const businessProfile = pgTable("business_profile", {
  numId: serial("num_id").unique(),
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  website: text("website"),
  logo: text("logo"),
  taxId: text("tax_id"),
  licenseNumber: text("license_number"),
  businessType: text("business_type").default("Computer Repair Shop"),
  description: text("description"),
  establishedDate: date("established_date"),
  ownerBio: text("owner_bio"),
  ownerPhoto: text("owner_photo"),
  yearsOfExperience: text("years_of_experience"),
  // Landing page statistics (can be manually overridden)
  totalCustomers: text("total_customers"),
  totalDevicesRepaired: text("total_devices_repaired"),
  monthlyAverageRepairs: text("monthly_average_repairs"),
  customerRetentionRate: text("customer_retention_rate"),
  averageRepairTime: text("average_repair_time"),
  warrantyRate: text("warranty_rate"),
  happyCustomers: text("happy_customers"),
  averageRating: text("average_rating"),
  customerSatisfactionRate: text("customer_satisfaction_rate"),
  // Business goals and targets
  monthlyRevenueTarget: decimal("monthly_revenue_target", {
    precision: 10,
    scale: 2,
  }),
  annualRevenueTarget: decimal("annual_revenue_target", {
    precision: 10,
    scale: 2,
  }),
  growthTargetPercentage: decimal("growth_target_percentage", {
    precision: 5,
    scale: 2,
  }).default("15.00"),
  specializations: jsonb("specializations"),
  awards: jsonb("awards"),
  testimonials: jsonb("testimonials"),
  workingHours: jsonb("working_hours"),
  socialLinks: jsonb("social_links"),
  bankingInfo: jsonb("banking_info"),
  insuranceInfo: jsonb("insurance_info"),
  certifications: jsonb("certifications"),
  publicInfo: jsonb("public_info"),
  // Landing page content management
  features: jsonb("features"),
  teamMembers: jsonb("team_members"),
  whyChooseUs: jsonb("why_choose_us"),
  // Mission, Vision & Values
  mission: text("mission"),
  vision: text("vision"),
  values: jsonb("values"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertBusinessProfileSchema = createInsertSchema(businessProfile)
  .omit({
    id: true,
    numId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    monthlyRevenueTarget: z.number().nullable(),
    annualRevenueTarget: z.number().nullable(),
    growthTargetPercentage: z.number().nullable(),
  });

export const selectBusinessProfileSchema = createSelectSchema(businessProfile);
export const updateBusinessProfileSchema =
  insertBusinessProfileSchema.partial();

// Types
export type BusinessProfile = typeof businessProfile.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type UpdateBusinessProfile = z.infer<typeof updateBusinessProfileSchema>;
