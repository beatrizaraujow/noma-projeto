import { cn } from '@/lib/utils';
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-gray-800 bg-[#1a1a1f] text-white',
        className
      )}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export { Card };
