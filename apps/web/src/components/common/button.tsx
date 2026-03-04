import { cn } from '@/lib/utils';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/30': variant === 'default',
            'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30':
              variant === 'destructive',
            'bg-[#25252b] hover:bg-[#2d2d35] text-white border border-gray-700':
              variant === 'outline' || variant === 'secondary',
            'bg-transparent hover:bg-[#25252b] text-gray-400 hover:text-white': variant === 'ghost',
            'underline-offset-4 hover:underline text-orange-400': variant === 'link',
          },
          {
            'h-10 py-2.5 px-4': size === 'default',
            'h-9 px-3 py-1.5': size === 'sm',
            'h-11 px-6 py-3': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
