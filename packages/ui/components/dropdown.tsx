import * as React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DropdownProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const Dropdown = ({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  open: controlledOpen,
  onOpenChange,
  className,
}: DropdownProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(open);
    }
    onOpenChange?.(open);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Close on Escape
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

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {React.cloneElement(trigger, {
        onClick: toggleDropdown,
        'aria-expanded': isOpen,
        'aria-haspopup': 'true',
      })}

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-dropdown bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div
            className={cn(
              'absolute z-dropdown',
              'min-w-[12rem] max-w-xs',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-lg',
              'py-1',
              'animate-in fade-in-0 zoom-in-95',
              sideClasses[side],
              alignClasses[align],
              className
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

// Dropdown Item
export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, leftIcon, rightIcon, selected, danger, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm',
        'transition-colors',
        'text-left',
        danger
          ? 'text-error hover:bg-error-light dark:hover:bg-red-900/20'
          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
        selected && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
        className
      )}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {selected && !rightIcon && <Check className="h-4 w-4 flex-shrink-0" />}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
);

DropdownItem.displayName = 'DropdownItem';

// Dropdown Separator
const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('my-1 h-px bg-neutral-200 dark:bg-neutral-700', className)}
    {...props}
  />
));

DropdownSeparator.displayName = 'DropdownSeparator';

// Dropdown Label
const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider',
      className
    )}
    {...props}
  />
));

DropdownLabel.displayName = 'DropdownLabel';

// Dropdown Submenu
export interface DropdownSubmenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DropdownSubmenu = ({ trigger, children, className }: DropdownSubmenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm',
          'text-neutral-700 dark:text-neutral-200',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          'transition-colors text-left'
        )}
      >
        {trigger}
        <ChevronRight className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-full top-0 ml-1',
            'min-w-[12rem] max-w-xs',
            'bg-white dark:bg-neutral-800',
            'border border-neutral-200 dark:border-neutral-700',
            'rounded-lg shadow-lg',
            'py-1',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

DropdownSubmenu.displayName = 'DropdownSubmenu';

export {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownSubmenu,
};
