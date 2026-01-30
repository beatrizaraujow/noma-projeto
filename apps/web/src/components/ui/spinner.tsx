/**
 * Spinner - Loading indicator component
 */
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  const variantClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

/**
 * Spinner with text
 */
export function SpinnerWithText({ text = 'Carregando...', size = 'md' }: { text?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-3">
      <Spinner size={size} />
      <span className="text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
}

/**
 * Full page spinner
 */
export function FullPageSpinner({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="text-center space-y-4">
        <Spinner size="xl" />
        {text && <p className="text-lg text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    </div>
  );
}

/**
 * Inline spinner for buttons
 */
export function ButtonSpinner() {
  return <Spinner size="sm" variant="white" className="mr-2" />;
}
