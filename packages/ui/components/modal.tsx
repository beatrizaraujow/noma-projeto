import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

// Modal Backdrop
const ModalBackdrop = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed inset-0 z-modalBackdrop bg-black/50 backdrop-blur-sm',
      'animate-in fade-in-0',
      className
    )}
    {...props}
  />
));

ModalBackdrop.displayName = 'ModalBackdrop';

// Modal Component
export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ open, onOpenChange, children, className }: ModalProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <ModalBackdrop onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-modal bg-white dark:bg-neutral-800',
          'rounded-lg shadow-2xl',
          'w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

// Modal Header
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-6 pb-4',
        'border-b border-neutral-200 dark:border-neutral-700',
        className
      )}
      {...props}
    >
      <div className="flex-1 pr-4">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
            'dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-700'
          )}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
);

ModalHeader.displayName = 'ModalHeader';

// Modal Body
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
));

ModalBody.displayName = 'ModalBody';

// Modal Footer
const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-4',
      'border-t border-neutral-200 dark:border-neutral-700',
      className
    )}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';

// Dialog Component (with predefined structure)
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} className={sizeClasses[size]}>
      <ModalHeader onClose={() => onOpenChange?.(false)}>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </ModalHeader>

      {children && <ModalBody>{children}</ModalBody>}

      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
};

Dialog.displayName = 'Dialog';

// Confirm Dialog
export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    />
  );
};

ConfirmDialog.displayName = 'ConfirmDialog';

export { Modal, ModalHeader, ModalBody, ModalFooter, Dialog, ConfirmDialog };
