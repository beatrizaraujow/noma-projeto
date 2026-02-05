'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer, AuthCard, SignupForm } from '@nexora/ui';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual signup API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      // TODO: Implement Google OAuth
      window.location.href = '/api/auth/google?mode=signup';
    } catch (err) {
      setError('Failed to sign up with Google');
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        logo={
          <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
        }
        title="Create your account"
        subtitle="Start managing your projects better"
      >
        <SignupForm
          onSubmit={handleSignup}
          onGoogleSignup={handleGoogleSignup}
          loading={loading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </AuthCard>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-white/80">
          © 2026 NOMA. All rights reserved.
        </p>
      </div>
    </AuthContainer>
  );
}
