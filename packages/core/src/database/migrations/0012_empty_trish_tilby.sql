CREATE TABLE IF NOT EXISTS "prizeEmbeddings" (
	"prizeId" text PRIMARY KEY NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prizeEmbeddings" ADD CONSTRAINT "prizeEmbeddings_prizeId_prizes_id_fk" FOREIGN KEY ("prizeId") REFERENCES "public"."prizes"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "prizeEmbeddings" USING hnsw ("embedding" vector_cosine_ops);