'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer, AuthCard, ForgotPasswordForm } from '@nexora/ui';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (email: string) => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual forgot password API call
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset link');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/auth/login');
  };

  return (
    <AuthContainer>
      <AuthCard
        logo={
          <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
        }
        title="Forgot password?"
        subtitle="No worries, we'll send you reset instructions"
      >
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          onBack={handleBack}
          loading={loading}
          success={success}
          error={error}
        />

        {!success && (
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              ← Back to login
            </Link>
          </div>
        )}
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
