ALTER TABLE "brands" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "device_types" ADD COLUMN "active" boolean DEFAULT true NOT NULL;