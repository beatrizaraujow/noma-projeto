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
  value = '—',
  trend,
  period = 'September'
}) => {
  const data: { label: string; value1: number; value2: number; value3: number }[] = [];

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
        {['—', '—', '—', '—'].map((val, index) => (
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
