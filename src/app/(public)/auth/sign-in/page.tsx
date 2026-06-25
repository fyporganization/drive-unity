import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignInForm from './components/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | DriveUnity',
  description: 'Sign in to your DriveUnity account',
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
