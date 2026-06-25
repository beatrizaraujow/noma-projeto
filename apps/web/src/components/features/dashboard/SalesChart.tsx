'use client';

import React from 'react';
import { MixedChart } from './MixedChart';

interface SalesChartProps {
  title?: string;
  data?: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  period?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  title = 'Sales Dynamic',
  data = [],
  period = 'One Year'
}) => {
  return (
    <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Pedidos</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#25252b] px-3 py-2 rounded-lg border border-gray-700">
          <span className="text-gray-400 text-sm">{period}</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <MixedChart data={data} height={300} />
    </div>
  );
};

