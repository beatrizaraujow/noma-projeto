'use client';

import React from 'react';

interface LineChartDataPoint {
  label: string;
  value1: number;
  value2: number;
  value3: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  colors?: string[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  colors = ['#f97316', '#8b5cf6', '#ec4899']
}) => {
  const maxValue = Math.max(
    ...data.flatMap(d => [d.value1, d.value2, d.value3])
  );
  
  const getPoints = (values: number[]) => {
    const width = 100;
    const segmentWidth = width / (values.length - 1);
    
    return values.map((value, index) => {
      const x = index * segmentWidth;
      const y = 100 - (value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  const values1 = data.map(d => d.value1);
  const values2 = data.map(d => d.value2);
  const values3 = data.map(d => d.value3);

  return (
    <div className="w-full h-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#2d2d35"
            strokeWidth="0.2"
          />
        ))}

        {/* Line 3 */}
        <polyline
          points={getPoints(values3)}
          fill="none"
          stroke={colors[2]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Line 2 */}
        <polyline
          points={getPoints(values2)}
          fill="none"
          stroke={colors[1]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Line 1 */}
        <polyline
          points={getPoints(values1)}
          fill="none"
          stroke={colors[0]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Points for Line 1 */}
        {values1.map((value, index) => {
          const x = (index / (values1.length - 1)) * 100;
          const y = 100 - (value / maxValue) * 100;
          return (
            <circle
              key={`point-1-${index}`}
              cx={x}
              cy={y}
              r="1"
              fill={colors[0]}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
    </div>
  );
};
