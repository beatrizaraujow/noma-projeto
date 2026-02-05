import * as React from 'react';
import { cn } from '../lib/utils';

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  lastUpdate: Date;
}

export interface CursorTrackerProps {
  cursors: RemoteCursor[];
  className?: string;
}

const CURSOR_COLORS = [
  '#FF5722', // Orange
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#FFC107', // Yellow
  '#F44336', // Red
  '#3F51B5', // Indigo
];

export const CursorTracker = React.forwardRef<HTMLDivElement, CursorTrackerProps>(
  ({ cursors, className }, ref) => {
    const [activeCursors, setActiveCursors] = React.useState<RemoteCursor[]>([]);

    // Filter out stale cursors (not updated in last 5 seconds)
    React.useEffect(() => {
      const now = new Date();
      const active = cursors.filter(
        (cursor) => now.getTime() - cursor.lastUpdate.getTime() < 5000
      );
      setActiveCursors(active);
    }, [cursors]);

    if (activeCursors.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn('fixed inset-0 pointer-events-none z-50', className)}
      >
        {activeCursors.map((cursor) => (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-75 ease-linear"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M5 3L19 12L12 13L9 20L5 3Z"
                fill={cursor.color || CURSOR_COLORS[0]}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* User name label */}
            <div
              className="absolute left-6 top-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap pointer-events-none"
              style={{
                backgroundColor: cursor.color || CURSOR_COLORS[0],
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {cursor.userName}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

CursorTracker.displayName = 'CursorTracker';
