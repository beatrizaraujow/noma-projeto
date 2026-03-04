'use client';

import { Card } from '@/components/common';
import SmoothAreaLineChart from './SmoothAreaLineChart';
import { weeklyProductivityMockData } from './weeklyProductivityMockData';

export default function WeeklyProductivityChart() {
  return (
    <Card className="p-6 bg-[#1a1a1f] border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Produtividade Semanal</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-400">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-400">Pedidos</span>
          </div>
        </div>
        <select className="bg-[#25252b] text-gray-300 text-sm px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500">
          <option>Esta Semana</option>
          <option>Última Semana</option>
          <option>Este Mês</option>
        </select>
      </div>

      <SmoothAreaLineChart
        data={weeklyProductivityMockData}
        xKey="time"
        series={[
          {
            key: 'receita',
            label: 'Receita',
            stroke: '#ef4444',
            fill: '#ef4444',
          },
          {
            key: 'pedidos',
            label: 'Pedidos',
            stroke: '#f97316',
            fill: '#f97316',
          },
        ]}
      />
    </Card>
  );
}
