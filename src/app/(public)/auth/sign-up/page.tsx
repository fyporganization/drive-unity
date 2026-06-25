import type { Metadata } from 'next';
import SignUpForm from './components/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | DriveUnity',
  description: 'Create your DriveUnity account',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
