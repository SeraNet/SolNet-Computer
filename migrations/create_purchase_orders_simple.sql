-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"num_id" serial UNIQUE NOT NULL,
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL UNIQUE,
	"date" date NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"supplier_id" varchar,
	"location_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_estimated_cost" decimal(10,2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"priority" varchar DEFAULT 'normal' NOT NULL,
	"expected_delivery_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
	"num_id" serial UNIQUE NOT NULL,
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" varchar NOT NULL,
	"inventory_item_id" varchar,
	"item_name" text NOT NULL,
	"description" text,
	"suggested_quantity" integer DEFAULT 1 NOT NULL,
	"estimated_price" decimal(10,2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
