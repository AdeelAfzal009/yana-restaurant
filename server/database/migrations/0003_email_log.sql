CREATE TABLE "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer,
	"template" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"provider_id" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_log_reservation_idx" ON "email_log" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "email_log_template_idx" ON "email_log" USING btree ("template");