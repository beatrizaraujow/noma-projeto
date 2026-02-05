import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeButton?: boolean;
  className?: string;
  contentClassName?: string;
}

const Popover = ({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  open: controlledOpen,
  onOpenChange,
  closeButton = false,
  className,
  contentClassName,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(open);
    }
    onOpenChange?.(open);
  };

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const sideClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  const alignClasses = {
    start: {
      top: 'left-0',
      bottom: 'left-0',
      left: 'top-0',
      right: 'top-0',
    },
    center: {
      top: 'left-1/2 -translate-x-1/2',
      bottom: 'left-1/2 -translate-x-1/2',
      left: 'top-1/2 -translate-y-1/2',
      right: 'top-1/2 -translate-y-1/2',
    },
    end: {
      top: 'right-0',
      bottom: 'right-0',
      left: 'bottom-0',
      right: 'bottom-0',
    },
  };

  return (
    <div ref={popoverRef} className={cn('relative inline-block', className)}>
      {React.cloneElement(trigger, {
        onClick: togglePopover,
        'aria-expanded': isOpen,
        'aria-haspopup': 'true',
      })}
      
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-modalBackdrop bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover content */}
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute z-popover',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              'w-max max-w-[calc(100vw-2rem)]',
              sideClasses[side],
              alignClasses[align][side],
              contentClassName
            )}
          >
            {closeButton && (
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'absolute top-2 right-2 p-1 rounded-md',
                  'text-neutral-400 hover:text-neutral-600',
                  'dark:text-neutral-500 dark:hover:text-neutral-300',
                  'transition-colors'
                )}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className={closeButton ? 'pr-8' : ''}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Popover.displayName = 'Popover';

// Popover subcomponents for better composition
export const PopoverContent = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => (
  <div className={cn('p-4', className)}>
    {children}
  </div>
);

export const PopoverHeader = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => (
  <div className={cn('px-4 py-3 border-b border-neutral-200 dark:border-neutral-700', className)}>
    {children}
  </div>
);

export const PopoverFooter = ({ 
  className, 
  children 
}: { 
  className?: string; 
  children: React.ReactNode;
}) => (
  <div className={cn('px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2 justify-end', className)}>
    {children}
  </div>
);

export { Popover };
