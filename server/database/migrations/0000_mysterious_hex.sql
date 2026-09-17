CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('manager', 'host');--> statement-breakpoint
CREATE TABLE "blackout_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"reason" text,
	CONSTRAINT "blackout_dates_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(12) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"party_size" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"notes" text,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "service_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"opens_at" time NOT NULL,
	"closes_at" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"slot_interval_minutes" integer DEFAULT 15 NOT NULL,
	"max_party_size" integer DEFAULT 10 NOT NULL,
	"max_covers_per_slot" integer DEFAULT 40 NOT NULL,
	"min_lead_minutes" integer DEFAULT 30 NOT NULL,
	"max_advance_days" integer DEFAULT 180 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "staff_role" DEFAULT 'host' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "reservations_date_idx" ON "reservations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");