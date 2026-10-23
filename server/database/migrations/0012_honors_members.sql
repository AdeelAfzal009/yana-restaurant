CREATE TYPE "public"."honors_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."honors_tier" AS ENUM('silver', 'platinum');--> statement-breakpoint
CREATE SEQUENCE "public"."honors_member_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "honors_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_id" integer NOT NULL,
	"member_number" text DEFAULT 'YH-' || lpad(nextval('honors_member_number_seq')::text, 6, '0') NOT NULL,
	"tier" "honors_tier" NOT NULL,
	"discount_percent" integer NOT NULL,
	"status" "honors_status" DEFAULT 'active' NOT NULL,
	"token" text,
	"token_expires_at" timestamp with time zone,
	"token_used_at" timestamp with time zone,
	"issued_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "honors_members_guest_id_unique" UNIQUE("guest_id"),
	CONSTRAINT "honors_members_member_number_unique" UNIQUE("member_number"),
	CONSTRAINT "honors_members_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "honors_members" ADD CONSTRAINT "honors_members_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honors_members" ADD CONSTRAINT "honors_members_issued_by_staff_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;