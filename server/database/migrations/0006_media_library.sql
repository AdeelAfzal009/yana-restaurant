CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"ext" text NOT NULL,
	"hash" varchar(16) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"data" "bytea" NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_staff_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;