import type { Metadata } from 'next';
import PrivacyContent from './content';

export const metadata: Metadata = {
  title: 'Privacy Policy | DriveUnity',
  description: 'How DriveUnity collects, uses, and protects your data.',
};

const page = () => {
  return (
    <div>
      <PrivacyContent />
    </div>
  );
};

export default page;
