import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface grid-pattern relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/home" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-display font-bold text-lg">D</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">DriveUnity</span>
        </Link>

        {/* Card */}
        <div className="glass rounded-2xl shadow-elevated p-8 border border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}
