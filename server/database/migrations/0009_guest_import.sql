ALTER TABLE "guests" ADD COLUMN "prior_visits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "prior_no_shows" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "prior_cancellations" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "prior_last_visit" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "imported_from" text;