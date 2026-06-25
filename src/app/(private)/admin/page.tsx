import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { StatsCards } from './_components/StatsCards';
import { FailedFilesList } from './_components/FailedFilesList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · Multi-Drive Provider' };

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.id) notFound();

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') notFound();

  const stats = await loadStats();
  const failedGoogleFiles = await db.googleDriveFile.findMany({
    where: { indexStatus: 'FAILED' },
    select: {
      fileId: true,
      fileName: true,
      mimeType: true,
      indexError: true,
      googleDriveAccountId: true,
      account: { select: { gmailAccount: true, userId: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          RAG migration status · workflow ops · failed-file recovery
        </p>
      </header>

      <StatsCards stats={stats} />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">External tools</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <a
            className="px-3 py-1.5 border rounded-md hover:bg-accent"
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
          >
            Temporal UI ↗
          </a>
          <a
            className="px-3 py-1.5 border rounded-md hover:bg-accent"
            href="https://aistudio.google.com/usage"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini API usage ↗
          </a>
        </div>
      </section>

      <FailedFilesList files={failedGoogleFiles} />
    </div>
  );
}

async function loadStats() {
  const [
    googleFilesByStatus,
    oneDriveFilesByStatus,
    googleAccounts,
    oneDriveAccounts,
    chunkCount,
    embeddingCount,
    cacheEntries,
  ] = await Promise.all([
    db.googleDriveFile.groupBy({ by: ['indexStatus'], _count: { _all: true } }),
    db.oneDriveFile.groupBy({ by: ['indexStatus'], _count: { _all: true } }),
    db.googleDriveAccount.count(),
    db.oneDriveAccount.count(),
    db.fileChunk.count(),
    db.chunkEmbedding.count(),
    db.cacheEntry.count({ where: { expiresAt: { gt: new Date() } } }),
  ]);

  return {
    googleFilesByStatus: Object.fromEntries(
      googleFilesByStatus.map((row) => [row.indexStatus, row._count._all])
    ),
    oneDriveFilesByStatus: Object.fromEntries(
      oneDriveFilesByStatus.map((row) => [row.indexStatus, row._count._all])
    ),
    googleAccounts,
    oneDriveAccounts,
    chunkCount,
    embeddingCount,
    dedupRatio:
      chunkCount > 0 ? Number((1 - embeddingCount / chunkCount).toFixed(3)) : 0,
    cacheEntries,
  };
}

export type AdminStats = Awaited<ReturnType<typeof loadStats>>;
