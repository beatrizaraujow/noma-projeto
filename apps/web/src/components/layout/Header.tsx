'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  tabs?: {
    id: string;
    label: string;
    active?: boolean;
  }[];
  onTabChange?: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, tabs, onTabChange }) => {
  return (
    <header className="bg-[#1a1a1f] border-b border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <h1 className="text-white text-2xl sm:text-3xl font-bold">{title}</h1>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:flex-none">
              <input
                type="text"
                placeholder="Buscar palavras-chave"
                className="w-full lg:w-80 bg-[#25252b] text-white text-sm pl-4 pr-10 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 bg-[#25252b] rounded-lg border border-gray-700 hover:border-orange-500 transition-colors">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <div className="inline-flex items-center gap-2 border border-gray-800 bg-[#16161a] rounded-xl p-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`
                  px-3 sm:px-4 py-2 text-sm font-medium transition-all rounded-lg relative
                  ${tab.active 
                    ? 'text-white bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#25252b]'
                  }
                `}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${tab.active ? 'bg-white' : 'bg-gray-600'}`}></span>
                {tab.label}
                </span>
              </button>
            ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
