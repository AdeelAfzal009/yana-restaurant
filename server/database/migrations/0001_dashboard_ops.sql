CREATE TYPE "public"."decor_kind" AS ENUM('wall', 'bar', 'zone', 'door', 'plant', 'label');--> statement-breakpoint
CREATE TYPE "public"."reservation_source" AS ENUM('online', 'phone', 'walk_in', 'staff');--> statement-breakpoint
CREATE TYPE "public"."table_shape" AS ENUM('square', 'rect', 'round');--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'waitlist';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'arrived';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'seated';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'finished';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'no_show';--> statement-breakpoint
CREATE TABLE "floor_decor" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"kind" "decor_kind" NOT NULL,
	"label" text,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floor_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"email" text,
	"phone" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"vip" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"name" text NOT NULL,
	"min_covers" integer DEFAULT 1 NOT NULL,
	"max_covers" integer NOT NULL,
	"shape" "table_shape" DEFAULT 'square' NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "guest_id" integer;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "table_id" integer;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "duration_minutes" integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "source" "reservation_source" DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "arrived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "seated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "finished_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "floor_decor" ADD CONSTRAINT "floor_decor_section_id_floor_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."floor_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_section_id_floor_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."floor_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guests_email_unique" ON "guests" USING btree (lower("email")) WHERE "guests"."email" is not null;--> statement-breakpoint
CREATE INDEX "guests_phone_idx" ON "guests" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "restaurant_tables_section_idx" ON "restaurant_tables" USING btree ("section_id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_restaurant_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."restaurant_tables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservations_guest_idx" ON "reservations" USING btree ("guest_id");--> statement-breakpoint
-- Backfill: one guest profile per distinct email from existing bookings.
INSERT INTO "guests" ("first_name", "last_name", "email", "phone", "created_at")
SELECT DISTINCT ON (lower("email")) "first_name", "last_name", "email", "phone", "created_at"
FROM "reservations"
WHERE "email" IS NOT NULL
ORDER BY lower("email"), "created_at" DESC;--> statement-breakpoint
UPDATE "reservations" r SET "guest_id" = g."id"
FROM "guests" g
WHERE r."email" IS NOT NULL AND lower(r."email") = lower(g."email");--> statement-breakpoint
-- Seed YANA's floor plan (Main dining room + Outdoor terrace) on a 1400×800 canvas.
INSERT INTO "floor_sections" ("name", "sort_order") VALUES ('Main', 0), ('Outdoor', 1);--> statement-breakpoint
INSERT INTO "restaurant_tables" ("section_id", "name", "min_covers", "max_covers", "shape", "x", "y", "width", "height", "sort_order")
SELECT s."id", t.name, t.min_c, t.max_c, t.shape::table_shape, t.x, t.y, t.w, t.h, t.ord
FROM "floor_sections" s
JOIN (VALUES
  ('Main', 'P4', 2, 4, 'round', 997, 43, 80, 80, 1),
  ('Main', 'P3', 2, 4, 'round', 1104, 43, 80, 80, 2),
  ('Main', 'P1', 2, 4, 'round', 1012, 135, 80, 80, 3),
  ('Main', 'P2', 2, 4, 'round', 1104, 135, 80, 80, 4),
  ('Main', '7', 2, 5, 'square', 998, 245, 78, 76, 5),
  ('Main', '6', 2, 3, 'square', 1106, 245, 78, 76, 6),
  ('Main', '5', 2, 4, 'round', 1259, 198, 94, 94, 7),
  ('Main', '4', 2, 4, 'round', 1244, 366, 94, 94, 8),
  ('Main', '2', 2, 4, 'round', 1075, 424, 94, 94, 9),
  ('Main', '1', 2, 4, 'round', 983, 547, 94, 94, 10),
  ('Main', '3', 2, 4, 'round', 1198, 536, 94, 94, 11),
  ('Main', '9', 4, 8, 'rect', 308, 198, 142, 55, 12),
  ('Main', '8', 2, 4, 'square', 491, 198, 79, 63, 13),
  ('Main', 'VIP 4', 2, 5, 'square', 15, 305, 78, 63, 14),
  ('Main', 'VIP 5', 1, 2, 'square', 123, 290, 78, 63, 15),
  ('Main', 'VIP 6', 1, 2, 'square', 215, 290, 78, 63, 16),
  ('Main', 'VIP 3', 2, 3, 'square', 15, 428, 78, 63, 17),
  ('Main', 'VIP 2', 2, 4, 'square', 123, 428, 78, 63, 18),
  ('Main', 'VIP 1', 2, 4, 'square', 215, 428, 78, 63, 19),
  ('Main', '11', 2, 4, 'round', 353, 366, 94, 94, 20),
  ('Main', '12', 2, 4, 'round', 476, 398, 94, 94, 21),
  ('Main', '10', 2, 5, 'rect', 322, 505, 61, 100, 22),
  ('Main', 'BAR6', 1, 2, 'square', 629, 382, 63, 63, 23),
  ('Main', 'BAR5', 1, 2, 'square', 767, 382, 63, 63, 24),
  ('Main', 'BAR4', 1, 2, 'square', 891, 382, 63, 63, 25),
  ('Main', 'BAR1', 1, 2, 'square', 629, 459, 63, 63, 26),
  ('Main', 'BAR2', 1, 2, 'square', 767, 459, 63, 63, 27),
  ('Main', 'BAR3', 1, 2, 'square', 891, 459, 63, 63, 28),
  ('Outdoor', 'T12', 6, 13, 'rect', 57, 382, 183, 84, 1),
  ('Outdoor', 'T11', 2, 5, 'rect', 285, 369, 76, 114, 2),
  ('Outdoor', 'T10', 2, 5, 'rect', 399, 369, 76, 114, 3),
  ('Outdoor', 'T9', 2, 5, 'rect', 513, 369, 76, 114, 4),
  ('Outdoor', 'T8', 3, 6, 'rect', 613, 340, 92, 175, 5),
  ('Outdoor', 'T7', 2, 5, 'rect', 841, 340, 92, 175, 6),
  ('Outdoor', 'T6', 1, 2, 'square', 970, 326, 60, 60, 7),
  ('Outdoor', 'T4', 1, 2, 'square', 1084, 326, 60, 60, 8),
  ('Outdoor', 'T2', 1, 2, 'square', 1184, 326, 60, 60, 9),
  ('Outdoor', 'T5', 1, 2, 'square', 970, 483, 60, 60, 10),
  ('Outdoor', 'T3', 1, 2, 'square', 1084, 483, 60, 60, 11),
  ('Outdoor', 'T1', 1, 2, 'square', 1184, 483, 60, 60, 12)
) AS t(section, name, min_c, max_c, shape, x, y, w, h, ord) ON t.section = s."name";--> statement-breakpoint
INSERT INTO "floor_decor" ("section_id", "kind", "label", "x", "y", "width", "height")
SELECT s."id", d.kind::decor_kind, d.label, d.x, d.y, d.w, d.h
FROM "floor_sections" s
JOIN (VALUES
  ('Main', 'wall', NULL, 303, 163, 298, 24),
  ('Main', 'bar', 'Bar', 600, 195, 361, 82),
  ('Main', 'zone', NULL, 620, 367, 342, 173),
  ('Main', 'wall', NULL, 1013, 218, 161, 8),
  ('Main', 'wall', NULL, 1228, 157, 8, 161),
  ('Main', 'door', 'Main door', 419, 637, 72, 30),
  ('Outdoor', 'door', NULL, 841, 225, 76, 47),
  ('Outdoor', 'door', NULL, 91, 551, 103, 26),
  ('Outdoor', 'door', NULL, 733, 551, 102, 26),
  ('Outdoor', 'plant', NULL, 46, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 146, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 246, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 346, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 446, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 546, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 631, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 960, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 1074, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 1188, 213, 70, 70),
  ('Outdoor', 'plant', NULL, 631, 528, 70, 70),
  ('Outdoor', 'plant', NULL, 845, 528, 70, 70)
) AS d(section, kind, label, x, y, w, h) ON d.section = s."name";
