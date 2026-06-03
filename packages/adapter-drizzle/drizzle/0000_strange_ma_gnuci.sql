CREATE TYPE "public"."environment" AS ENUM('Node.js', 'Supabase');--> statement-breakpoint
CREATE TABLE "visit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"user_agent" text,
	"visited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitors_raw_email_unique" UNIQUE("raw_email")
);
--> statement-breakpoint
CREATE TABLE "ast_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content_body" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ast_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid,
	"author_id" text NOT NULL,
	"comment_text" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ast_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" uuid,
	"scenario" text NOT NULL,
	"request_count" integer NOT NULL,
	"avg_latency_ms" integer NOT NULL,
	"payload_size_kb" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" uuid NOT NULL,
	"environment" "environment" NOT NULL,
	"payload_size_kb" integer NOT NULL,
	"total_roundtrip_ms" integer,
	"backend_parse_ms" integer,
	"backend_db_insert_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ast_comments" ADD CONSTRAINT "ast_comments_article_id_ast_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."ast_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ast_results" ADD CONSTRAINT "ast_results_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE no action ON UPDATE no action;