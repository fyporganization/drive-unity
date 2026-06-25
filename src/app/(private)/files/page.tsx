import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Content } from '@/app/(private)/files/content';

export default async function FilesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  return <Content userId={session.id} />;
}
