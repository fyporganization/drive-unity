-- ============================================================================
-- Phase 5.3: Python + ChromaDB cutover
-- Drops the three tables created by the legacy Python backend's alembic
-- migrations. All semantic search now uses the polymorphic FileChunk +
-- ChunkEmbedding tables (pgvector, 768-dim, Gemini text-embedding-004).
-- ============================================================================

DROP TABLE IF EXISTS "google_drive_image_captions" CASCADE;
DROP TABLE IF EXISTS "google_drive_document_embeddings" CASCADE;
DROP TABLE IF EXISTS "alembic_version" CASCADE;
