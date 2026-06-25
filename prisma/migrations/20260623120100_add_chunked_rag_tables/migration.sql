-- ============================================================================
-- Phase 1.2: Chunked RAG schema additions
-- Adds:
--   - FileStatus + ProviderType enums
--   - chunk_embeddings table (dedup by chunk_hash, 768-dim vector for Gemini)
--   - file_chunks table (polymorphic to google/onedrive files via provider_type + file_id)
--   - cache_entries table (server-side cache with TTL)
--   - rate_limits table (per-user sliding window counters)
--   - HNSW index on chunk_embeddings.embedding for fast cosine similarity search
--   - content_hash, index_status, indexed_at, index_error columns on existing file tables
--   - start_page_token, last_sync_at on google_drive_accounts
--   - last_sync_at on one_drive_accounts
-- ============================================================================

-- Enums
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'INDEXING', 'INDEXED', 'FAILED', 'SKIPPED');
CREATE TYPE "ProviderType" AS ENUM ('google', 'onedrive');

-- Extend existing file tables with index tracking
ALTER TABLE "google_drive_files"
  ADD COLUMN "content_hash" VARCHAR(64),
  ADD COLUMN "index_status" "FileStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "indexed_at"   TIMESTAMPTZ(6),
  ADD COLUMN "index_error"  TEXT;

CREATE INDEX "idx_google_drive_files_index_status" ON "google_drive_files" ("index_status");
CREATE INDEX "idx_google_drive_files_content_hash" ON "google_drive_files" ("content_hash");

ALTER TABLE "one_drive_files"
  ADD COLUMN "content_hash" VARCHAR(64),
  ADD COLUMN "index_status" "FileStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "indexed_at"   TIMESTAMPTZ(6),
  ADD COLUMN "index_error"  TEXT;

CREATE INDEX "idx_one_drive_files_index_status" ON "one_drive_files" ("index_status");
CREATE INDEX "idx_one_drive_files_content_hash" ON "one_drive_files" ("content_hash");

-- Sync cursors for incremental Drive deltas
ALTER TABLE "google_drive_accounts"
  ADD COLUMN "start_page_token" VARCHAR(255),
  ADD COLUMN "last_sync_at"     TIMESTAMPTZ(6);

ALTER TABLE "one_drive_accounts"
  ADD COLUMN "last_sync_at" TIMESTAMPTZ(6);

-- chunk_embeddings: one row per unique chunk_hash (dedup cache for Gemini API)
CREATE TABLE "chunk_embeddings" (
  "id"         VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  "chunk_hash" VARCHAR(64)  NOT NULL,
  "embedding"  vector(768)  NOT NULL,
  "model"      VARCHAR(64)  NOT NULL,
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chunk_embeddings_pkey"        PRIMARY KEY ("id"),
  CONSTRAINT "chunk_embeddings_chunk_hash_key" UNIQUE ("chunk_hash")
);

-- HNSW index for fast cosine similarity search (sub-100ms up to 10M+ rows)
CREATE INDEX "idx_chunk_embeddings_hnsw"
  ON "chunk_embeddings"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- file_chunks: polymorphic chunks linked to either google_drive_files or one_drive_files
-- No hard FK to file tables (polymorphic). Application-level integrity enforced by workers.
-- FK to chunk_embeddings is enforced (Restrict — never orphan an embedding referenced by chunks).
CREATE TABLE "file_chunks" (
  "id"            VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"       VARCHAR(255) NOT NULL,
  "provider_type" "ProviderType" NOT NULL,
  "account_id"    VARCHAR(255) NOT NULL,
  "file_id"       VARCHAR(255) NOT NULL,
  "chunk_index"   INTEGER NOT NULL,
  "content"       TEXT NOT NULL,
  "chunk_hash"    VARCHAR(64) NOT NULL,
  "embedding_id"  VARCHAR(255) NOT NULL,
  "created_at"    TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "file_chunks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_file_chunk_provider_file_index" UNIQUE ("provider_type", "file_id", "chunk_index"),
  CONSTRAINT "file_chunks_user_id_fkey"     FOREIGN KEY ("user_id")      REFERENCES "users"("id")            ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "file_chunks_embedding_id_fkey" FOREIGN KEY ("embedding_id") REFERENCES "chunk_embeddings"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
);

CREATE INDEX "idx_file_chunk_provider_file"  ON "file_chunks" ("provider_type", "file_id");
CREATE INDEX "idx_file_chunk_hash"           ON "file_chunks" ("chunk_hash");
CREATE INDEX "idx_file_chunk_user_provider"  ON "file_chunks" ("user_id", "provider_type");
CREATE INDEX "idx_file_chunk_account"        ON "file_chunks" ("account_id");

-- cache_entries: generic key-value cache with TTL (CleanupWorkflow purges expired rows daily)
CREATE TABLE "cache_entries" (
  "key"        VARCHAR(255) NOT NULL,
  "value"      JSONB NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "idx_cache_expires_at" ON "cache_entries" ("expires_at");

-- rate_limits: sliding-window counters per user+action
CREATE TABLE "rate_limits" (
  "id"        VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"   VARCHAR(255) NOT NULL,
  "action"    VARCHAR(64) NOT NULL,
  "window_at" TIMESTAMPTZ(6) NOT NULL,
  "count"     INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "uq_rate_limit_user_action_window" UNIQUE ("user_id", "action", "window_at"),
  CONSTRAINT "rate_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_rate_limit_window" ON "rate_limits" ("window_at");
