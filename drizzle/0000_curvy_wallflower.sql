CREATE TABLE "chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(100),
	"message" text NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"unit" varchar(20) DEFAULT 'kg',
	"season_start" integer,
	"season_end" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "crops_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(50) NOT NULL,
	"file_url" text,
	"rows" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demand_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer,
	"region_id" integer,
	"demand_level" varchar(20) NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"population_estimate" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"region_id" integer,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"type" varchar(50) DEFAULT 'public',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer,
	"region_id" integer,
	"price" numeric(10, 2) NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"quantity" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer,
	"region_id" integer,
	"predicted_price" numeric(10, 2),
	"demand_level" varchar(20),
	"best_market_id" integer,
	"selling_strategy" varchar(100),
	"price_trend" varchar(50),
	"confidence_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"province" varchar(100),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "regions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "demand_data" ADD CONSTRAINT "demand_data_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_data" ADD CONSTRAINT "demand_data_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_best_market_id_markets_id_fk" FOREIGN KEY ("best_market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;