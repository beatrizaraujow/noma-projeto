'use client';

import { motion } from 'framer-motion';
import { useMobileDetect } from '@/hooks/useMobileDetect';

interface FABProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function FAB({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  variant = 'primary',
  className = '',
}: FABProps) {
  const { isMobile } = useMobileDetect();

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-500/50',
  };

  if (!isMobile) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        fixed z-40 flex items-center gap-3 px-4 h-14 rounded-full
        font-medium transition-all duration-200
        ${positionClasses[position]}
        ${variantClasses[variant]}
        ${label ? 'min-w-14' : 'w-14 justify-center'}
        ${className}
      `}
      style={{ touchAction: 'manipulation' }}
      aria-label={label || 'Action button'}
    >
      <div className="w-6 h-6">{icon}</div>
      {label && (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          className="whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  );
}
