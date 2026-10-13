ALTER TABLE "reservations" ADD COLUMN "imported_from" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_external_id_unique" ON "reservations" USING btree ("external_id") WHERE "reservations"."external_id" is not null;