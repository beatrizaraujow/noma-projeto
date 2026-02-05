'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer, AuthCard, LoginForm } from '@nexora/ui';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();
      
      // Redirect to dashboard or onboarding
      if (result.needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // TODO: Implement Google OAuth
      window.location.href = '/api/auth/google';
    } catch (err) {
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <AuthContainer>
      <AuthCard
        logo={
          <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
        }
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      >
        <LoginForm
          onSubmit={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onForgotPassword={handleForgotPassword}
          loading={loading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign up
            </Link>
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
