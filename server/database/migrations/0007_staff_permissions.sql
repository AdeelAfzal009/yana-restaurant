ALTER TABLE "staff" ADD COLUMN "permissions" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
-- Hosts keep exactly what they could open before access became configurable.
UPDATE "staff" SET "permissions" = '{reservations,guests,reports}' WHERE "role" = 'host';
