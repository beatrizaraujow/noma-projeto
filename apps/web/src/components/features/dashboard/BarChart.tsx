'use client';

import React from 'react';

interface BarChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  highlightIndex?: number;
  highlightColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  barColor = '#8b5cf6',
  highlightIndex,
  highlightColor = '#a78bfa'
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full h-full flex items-end justify-between gap-1 px-1">
      {data.map((item, index) => {
        const heightPercentage = (item.value / maxValue) * 100;
        const isHighlighted = highlightIndex === index;
        
        return (
          <div 
            key={`${item.label}-${index}`}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div 
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                height: `${heightPercentage}%`,
                backgroundColor: isHighlighted ? highlightColor : barColor,
                minHeight: '4px'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
