import { BackfillAccountButton } from './BackfillAccountButton';

interface FailedFile {
  fileId: string;
  fileName: string;
  mimeType: string;
  indexError: string | null;
  googleDriveAccountId: string;
  account: { gmailAccount: string; userId: string };
}

export function FailedFilesList({ files }: { files: FailedFile[] }) {
  if (files.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Failed files</h2>
        <p className="text-sm text-muted-foreground">No failed files. ✨</p>
      </section>
    );
  }

  const grouped = new Map<string, { account: FailedFile['account']; files: FailedFile[] }>();
  for (const f of files) {
    const existing = grouped.get(f.googleDriveAccountId);
    if (existing) {
      existing.files.push(f);
    } else {
      grouped.set(f.googleDriveAccountId, { account: f.account, files: [f] });
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        Failed files
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({files.length} across {grouped.size} {grouped.size === 1 ? 'account' : 'accounts'})
        </span>
      </h2>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([accountId, { account, files: accountFiles }]) => (
          <div key={accountId} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-sm">{account.gmailAccount}</div>
                <div className="text-xs text-muted-foreground">
                  account {accountId.slice(0, 8)}… · {accountFiles.length} failed
                </div>
              </div>
              <BackfillAccountButton
                userId={account.userId}
                accountId={accountId}
                provider="google"
              />
            </div>

            <ul className="space-y-1 text-sm max-h-64 overflow-auto pr-2">
              {accountFiles.map((f) => (
                <li key={f.fileId} className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0">{f.mimeType.split('/').pop()}</span>
                  <span className="font-medium truncate" title={f.fileName}>
                    {f.fileName}
                  </span>
                  {f.indexError ? (
                    <span className="text-xs text-muted-foreground truncate" title={f.indexError}>
                      — {f.indexError}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
