'use client';

import React from 'react';
import { BarChart } from './BarChart';
import { Badge } from '@/components/common';

interface MonthlyProfitCardProps {
  value?: string;
  trend?: number;
  data?: number[];
}

export const MonthlyProfitCard: React.FC<MonthlyProfitCardProps> = ({
  value = '$43,521.58',
  trend = 12.5,
  data = [4200, 3800, 4500, 5200, 4800, 5500, 6100, 5800, 4900, 5300, 6000, 5700]
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Monthly Profit</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-white text-2xl font-bold">{value}</span>
            {trend && (
              <Badge variant="info" size="sm">
                +{trend}%
              </Badge>
            )}
          </div>
        </div>
        
        <button className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      <p className="text-gray-500 text-xs mb-6">Sep</p>

      <div className="h-32">
        <BarChart 
          data={data.map((value, index) => ({
            label: months[index],
            value
          }))}
          height={128}
          barColor="#8b5cf6"
          highlightIndex={8}
        />
      </div>

      {/* Month labels */}
      <div className="flex justify-between mt-2 px-1">
        {['Jul', 'Aug', 'Sep', 'Oct'].map((month, index) => (
          <span key={month} className={`text-xs ${index === 2 ? 'text-white' : 'text-gray-600'}`}>
            {month}
          </span>
        ))}
      </div>
    </div>
  );
};
