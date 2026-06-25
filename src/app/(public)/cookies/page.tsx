import type { Metadata } from 'next';
import CookiesContent from './content';

export const metadata: Metadata = {
  title: 'Cookie Policy | DriveUnity',
  description: 'How DriveUnity uses cookies and similar technologies.',
};

const page = () => {
  return (
    <div>
      <CookiesContent />
    </div>
  );
};

export default page;
