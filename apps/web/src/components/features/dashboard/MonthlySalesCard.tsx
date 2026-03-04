'use client';

import React from 'react';
import { LineChart } from './LineChart';
import { Dropdown } from '@/components/common';

interface MonthlySalesCardProps {
  value?: string;
  trend?: number;
  period?: string;
}

export const MonthlySalesCard: React.FC<MonthlySalesCardProps> = ({
  value = '$21,845',
  trend = 8.2,
  period = 'September'
}) => {
  const data = [
    { label: 'Jul', value1: 18000, value2: 19500, value3: 17800 },
    { label: 'Aug', value1: 19200, value2: 20100, value3: 18900 },
    { label: 'Sep', value1: 21845, value2: 22300, value3: 21200 },
    { label: 'Oct', value1: 20500, value2: 21800, value3: 20200 },
  ];

  return (
    <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Monthly Sales</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-2xl font-bold">{value}</span>
            {trend && (
              <span className="text-red-400 text-sm font-semibold bg-red-500/20 px-2 py-0.5 rounded">
                +{trend}%
              </span>
            )}
          </div>
        </div>

        <Dropdown
          options={[
            { value: 'sep', label: 'September' },
            { value: 'oct', label: 'October' },
            { value: 'nov', label: 'November' },
          ]}
          value="sep"
          className="w-32"
        />
      </div>

      <div className="h-40">
        <LineChart data={data} height={160} />
      </div>

      {/* Values footer */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
        {['$4,503', '$5.03', '$43,521', '$10.18'].map((val, index) => (
          <div key={index} className="text-center">
            <div className={`text-sm font-semibold mb-1 ${
              index === 2 ? 'text-white' : 'text-gray-400'
            }`}>
              {val}
            </div>
            <div className="text-xs text-gray-600">
              {['Jul', 'Aug', 'Sep', 'Oct'][index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
