import type { Metadata } from 'next';
import TermsContent from './content';

export const metadata: Metadata = {
  title: 'Terms of Service | DriveUnity',
  description: 'The terms and conditions for using DriveUnity.',
};

const page = () => {
  return (
    <div>
      <TermsContent />
    </div>
  );
};

export default page;
