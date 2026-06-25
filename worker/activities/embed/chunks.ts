import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';
import { batchEmbed, EMBED_MODEL } from '@/lib/gemini';
import type { Chunk } from '@/lib/chunking';

export interface FileChunkContext {
  user_id: string;
  provider_type: 'google' | 'onedrive';
  account_id: string;
  file_id: string;
}

export interface EmbedResult {
  total_chunks: number;
  newly_embedded: number;
  reused_from_cache: number;
}

export async function embedAndUpsertChunks(
  ctx: FileChunkContext,
  chunks: Chunk[]
): Promise<EmbedResult> {
  if (chunks.length === 0) {
    await db.fileChunk.deleteMany({
      where: { providerType: ctx.provider_type, fileId: ctx.file_id },
    });
    return { total_chunks: 0, newly_embedded: 0, reused_from_cache: 0 };
  }

  const hashes = chunks.map((c) => c.hash);
  const existing = await db.chunkEmbedding.findMany({
    where: { chunkHash: { in: hashes } },
    select: { id: true, chunkHash: true },
  });
  const hashToEmbeddingId = new Map(existing.map((e) => [e.chunkHash, e.id]));

  const missing = chunks.filter((c) => !hashToEmbeddingId.has(c.hash));

  if (missing.length > 0) {
    const vectors = await batchEmbed(missing.map((c) => c.content));
    await insertEmbeddings(missing, vectors);

    const inserted = await db.chunkEmbedding.findMany({
      where: { chunkHash: { in: missing.map((c) => c.hash) } },
      select: { id: true, chunkHash: true },
    });
    for (const row of inserted) {
      hashToEmbeddingId.set(row.chunkHash, row.id);
    }
  }

  await db.$transaction([
    db.fileChunk.deleteMany({
      where: { providerType: ctx.provider_type, fileId: ctx.file_id },
    }),
    db.fileChunk.createMany({
      data: chunks.map((c) => {
        const embeddingId = hashToEmbeddingId.get(c.hash);
        if (!embeddingId) throw new Error(`Missing embedding for chunk hash ${c.hash}`);
        return {
          userId: ctx.user_id,
          providerType: ctx.provider_type,
          accountId: ctx.account_id,
          fileId: ctx.file_id,
          chunkIndex: c.index,
          content: c.content,
          chunkHash: c.hash,
          embeddingId,
        };
      }),
    }),
  ]);

  return {
    total_chunks: chunks.length,
    newly_embedded: missing.length,
    reused_from_cache: chunks.length - missing.length,
  };
}

async function insertEmbeddings(chunks: Chunk[], vectors: number[][]): Promise<void> {
  if (chunks.length === 0) return;
  if (chunks.length !== vectors.length) {
    throw new Error(`Embedding count mismatch: ${chunks.length} chunks, ${vectors.length} vectors`);
  }

  const values = Prisma.join(
    chunks.map(
      (c, i) => Prisma.sql`(
        gen_random_uuid()::text,
        ${c.hash},
        ${`[${vectors[i].join(',')}]`}::vector,
        ${EMBED_MODEL},
        NOW()
      )`
    )
  );

  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO chunk_embeddings (id, chunk_hash, embedding, model, created_at)
      VALUES ${values}
      ON CONFLICT (chunk_hash) DO NOTHING
    `
  );
}
