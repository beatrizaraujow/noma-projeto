'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  subtitle,
  icon,
  iconBgColor = 'bg-gray-800',
  iconColor = 'text-white',
  onClick
}) => {
  return (
    <div 
      className={`
        bg-[#1a1a1f] border border-gray-800 rounded-xl p-6
        ${onClick ? 'cursor-pointer hover:border-gray-700 transition-all' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
        {onClick && (
          <button className="text-gray-500 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        
        <div className="flex items-end gap-3">
          <span className="text-white text-3xl font-bold">{value}</span>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              trend.direction === 'up' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="text-xs font-semibold">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-gray-500 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
