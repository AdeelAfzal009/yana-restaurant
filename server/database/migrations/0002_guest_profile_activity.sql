CREATE TABLE "reservation_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer NOT NULL,
	"staff_id" integer,
	"action" text NOT NULL,
	"changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "salutation" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "marketing_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "birth_day" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "birth_month" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "anniversary_day" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "anniversary_month" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "anniversary_year" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "preferred_language" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "preferred_section_id" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "membership_id" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "membership_status" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "social_links" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "seated_guests" integer;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "notify_guest" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "reservation_activity" ADD CONSTRAINT "reservation_activity_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_activity" ADD CONSTRAINT "reservation_activity_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservation_activity_reservation_idx" ON "reservation_activity" USING btree ("reservation_id");--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_preferred_section_id_floor_sections_id_fk" FOREIGN KEY ("preferred_section_id") REFERENCES "public"."floor_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_staff_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_updated_by_staff_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;