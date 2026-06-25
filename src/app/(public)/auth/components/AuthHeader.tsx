import type { LucideIcon } from 'lucide-react';

interface AuthHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: React.ReactNode;
}

export default function AuthHeader({ icon: Icon, title, subtitle }: Readonly<AuthHeaderProps>) {
  return (
    <div className="text-center mb-8">
      <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
        <Icon className="w-7 h-7 text-primary-foreground" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
