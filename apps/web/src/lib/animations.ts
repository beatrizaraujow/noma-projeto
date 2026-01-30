/**
 * Micro-interactions and animations
 */

/**
 * Fade in animation
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

/**
 * Slide in from right
 */
export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

/**
 * Slide in from bottom
 */
export const slideInBottom = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

/**
 * Scale animation
 */
export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 25 },
};

/**
 * Bounce animation
 */
export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

/**
 * Stagger children
 */
export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Hover scale
 */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

/**
 * Hover lift
 */
export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
};

/**
 * Rotate on hover
 */
export const rotateOnHover = {
  whileHover: { rotate: 5 },
  transition: { type: 'spring', stiffness: 300 },
};

/**
 * Pulse animation (for notifications)
 */
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shimmer effect keyframes (for CSS)
 */
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

/**
 * Slide in animation keyframes (for CSS)
 */
export const slideInKeyframes = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
