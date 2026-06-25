import type { AdminStats } from '../page';

interface StatsCardsProps {
  stats: AdminStats;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  INDEXING: 'Indexing',
  INDEXED: 'Indexed',
  FAILED: 'Failed',
  SKIPPED: 'Skipped',
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Google Drive accounts" value={stats.googleAccounts} />
        <Card label="OneDrive accounts" value={stats.oneDriveAccounts} />
        <Card label="Live cache entries" value={stats.cacheEntries} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusBreakdown title="Google Drive — file index status" rows={stats.googleFilesByStatus} />
        <StatusBreakdown title="OneDrive — file index status" rows={stats.oneDriveFilesByStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Total file chunks" value={stats.chunkCount} />
        <Card label="Unique embeddings" value={stats.embeddingCount} />
        <Card
          label="Chunk dedup ratio"
          value={`${(stats.dedupRatio * 100).toFixed(1)}%`}
          hint="higher = more Gemini cost saved"
        />
      </div>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function StatusBreakdown({ title, rows }: { title: string; rows: Record<string, number> }) {
  const total = Object.values(rows).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-3 space-y-1.5">
        {(['PENDING', 'INDEXING', 'INDEXED', 'FAILED', 'SKIPPED'] as const).map((status) => {
          const count = rows[status] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="text-sm flex items-center gap-3">
              <span className="w-20 text-muted-foreground">{STATUS_LABELS[status]}</span>
              <span className="font-mono w-12 text-right">{count}</span>
              <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                <div className="h-full bg-foreground/40" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
        <div className="pt-2 mt-2 border-t text-xs text-muted-foreground">
          {total} files total
        </div>
      </div>
    </div>
  );
}
