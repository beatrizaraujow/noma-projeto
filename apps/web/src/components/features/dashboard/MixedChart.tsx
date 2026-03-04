'use client';

import React from 'react';

interface MixedChartDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface MixedChartProps {
  data: MixedChartDataPoint[];
  height?: number;
}

export const MixedChart: React.FC<MixedChartProps> = ({
  data,
  height = 300
}) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxOrders = Math.max(...data.map(d => d.orders));
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="h-full flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const revenueHeight = (item.revenue / maxRevenue) * 100;
          const ordersHeight = (item.orders / maxOrders) * 100;
          
          return (
            <div 
              key={`${item.month}-${index}`}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Chart bars */}
              <div className="w-full relative flex items-end justify-center gap-0.5" style={{ height: '85%' }}>
                {/* Revenue bar (red/orange) */}
                <div 
                  className="w-1/2 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${revenueHeight}%`,
                    backgroundColor: index === 8 ? '#f97316' : '#ef4444',
                    minHeight: '4px'
                  }}
                />
                
                {/* Orders bar (purple/blue) */}
                <div 
                  className="w-1/2 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${ordersHeight}%`,
                    backgroundColor: index === 8 ? '#6366f1' : '#8b5cf6',
                    minHeight: '4px'
                  }}
                />
              </div>
              
              {/* Month label */}
              <span className={`text-xs mt-2 ${
                index === 8 ? 'text-white font-semibold' : 'text-gray-600'
              }`}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-gray-600 text-xs -ml-8">
        <span>30K</span>
        <span>20K</span>
        <span>10K</span>
        <span>0</span>
      </div>
    </div>
  );
};
