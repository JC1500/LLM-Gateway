ALTER TABLE "api_keys" ALTER COLUMN "rate_limit_per_min" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "model_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "latency_ms" SET DEFAULT 0;