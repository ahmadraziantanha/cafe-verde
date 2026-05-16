import { Suspense } from 'react';
import { EmailAuthForm } from '@/components/auth/email-form';

export const metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
      <Suspense>
        <EmailAuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
