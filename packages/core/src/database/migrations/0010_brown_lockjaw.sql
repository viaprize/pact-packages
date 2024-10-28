ALTER TABLE "donations" RENAME COLUMN "amount" TO "valueInToken";--> statement-breakpoint
ALTER TABLE "donations" DROP CONSTRAINT "donations_username_user_username_fk";
--> statement-breakpoint
ALTER TABLE "donations" ALTER COLUMN "valueInToken" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "donations" ALTER COLUMN "valueInToken" SET DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "donations" ADD CONSTRAINT "donations_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "public"."user"("username") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
