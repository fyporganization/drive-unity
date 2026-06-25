-- Enable pgvector extension for embedding storage and similarity search.
-- Required by ChunkEmbedding model (vector(768) for Gemini text-embedding-004).
-- HNSW index is created in a later migration when ChunkEmbedding table exists.

CREATE EXTENSION IF NOT EXISTS vector;
