'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { checkmarkVariants } from './variants';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  size?: number;
  onComplete?: () => void;
}

export function SuccessCheckmark({ show, size = 64, onComplete }: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={onComplete}
          className="inline-flex items-center justify-center"
        >
          <motion.svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            className="text-green-500"
          >
            <motion.circle
              cx="32"
              cy="32"
              r="30"
              fill="currentColor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <motion.path
              d="M20 32 L28 40 L44 24"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkmarkVariants}
              initial="initial"
              animate="animate"
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SuccessConfetti({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
  const confettiCount = 50;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: confettiCount }).map((_, i) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = Math.random() * 100;
            const endX = startX + (Math.random() - 0.5) * 100;
            const duration = 1 + Math.random() * 2;
            const delay = Math.random() * 0.5;

            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: color,
                  left: `${startX}%`,
                  top: '-20px',
                }}
                initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 100,
                  x: (endX - startX) * 10,
                  opacity: [1, 1, 0],
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{
                  duration,
                  delay,
                  ease: 'easeIn',
                }}
                onAnimationComplete={() => {
                  if (i === confettiCount - 1 && onComplete) {
                    onComplete();
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

interface SuccessToastProps {
  message: string;
  show: boolean;
  duration?: number;
  withConfetti?: boolean;
  onClose?: () => void;
}

export function SuccessToast({ 
  message, 
  show, 
  duration = 3000,
  withConfetti = false,
  onClose 
}: SuccessToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show && withConfetti) {
      setShowConfetti(true);
    }

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, withConfetti, onClose]);

  return (
    <>
      {withConfetti && (
        <SuccessConfetti 
          show={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
      )}
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <SuccessCheckmark show={true} size={32} />
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
