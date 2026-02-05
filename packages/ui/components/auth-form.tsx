import * as React from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input-new';

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Auth Container with gradient background
export interface AuthContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthContainer = React.forwardRef<HTMLDivElement, AuthContainerProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gradient-to-br from-orange-400 via-red-500 to-red-900',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Organic shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-red-800/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  )
);

AuthContainer.displayName = 'AuthContainer';

// Auth Card
export interface AuthCardProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ children, logo, title, subtitle, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-8',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Logo */}
      {logo && (
        <div className="flex justify-center mb-6">
          {logo}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-neutral-600">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
);

AuthCard.displayName = 'AuthCard';

// Login Form
export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onForgotPassword?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
  ({ onSubmit, onGoogleLogin, onForgotPassword, loading = false, error, className }, ref) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit({ email, password });
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={loading}
          required
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {onForgotPassword && (
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {onGoogleLogin && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleLogin}
              disabled={loading}
              size="lg"
            >
              <GoogleIcon />
              <span className="ml-2">Sign in with Google</span>
            </Button>
          </>
        )}
      </form>
    );
  }
);

LoginForm.displayName = 'LoginForm';

// Signup Form
export interface SignupFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void | Promise<void>;
  onGoogleSignup?: () => void | Promise<void>;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const SignupForm = React.forwardRef<HTMLFormElement, SignupFormProps>(
  ({ onSubmit, onGoogleSignup, loading = false, error, className }, ref) => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit({ name, email, password });
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          disabled={loading}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={loading}
          required
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            disabled={loading}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        {onGoogleSignup && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleSignup}
              disabled={loading}
              size="lg"
            >
              <GoogleIcon />
              <span className="ml-2">Sign up with Google</span>
            </Button>
          </>
        )}
      </form>
    );
  }
);

SignupForm.displayName = 'SignupForm';

// Forgot Password Form
export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void | Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
  className?: string;
}

export const ForgotPasswordForm = React.forwardRef<HTMLFormElement, ForgotPasswordFormProps>(
  ({ onSubmit, onBack, loading = false, success = false, error, className }, ref) => {
    const [email, setEmail] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(email);
    };

    if (success) {
      return (
        <div className={cn('space-y-4 text-center', className)}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">Check your email</h3>
          <p className="text-neutral-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Back to login
            </Button>
          )}
        </div>
      );
    }

    return (
      <form ref={ref} onSubmit={handleSubmit} className={cn('space-y-4', className)}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <p className="text-neutral-600 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={loading}
          required
        />

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>

        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
            disabled={loading}
          >
            Back to login
          </Button>
        )}
      </form>
    );
  }
);

ForgotPasswordForm.displayName = 'ForgotPasswordForm';
