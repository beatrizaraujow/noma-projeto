'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Briefcase, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Search,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';

interface SidebarProps {
  activeItem?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const params = useParams();
  const pathname = usePathname();

  const workspaceIdParam = params?.id;
  const workspaceId = Array.isArray(workspaceIdParam) ? workspaceIdParam[0] : workspaceIdParam;
  const isWorkspaceContext = Boolean(workspaceId && pathname?.startsWith('/workspaces/'));

  const menuItems: MenuItem[] = isWorkspaceContext
    ? [
        { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} />, href: `/workspaces/${workspaceId}` },
        { id: 'workspace-dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, href: `/workspaces/${workspaceId}/dashboard` },
        { id: 'analytics', label: 'Análises', icon: <BarChart3 size={20} />, href: `/workspaces/${workspaceId}/analytics` },
        { id: 'deals', label: 'Meus negócios', icon: <Briefcase size={20} />, href: `/workspaces/${workspaceId}/projects` },
        { id: 'customers', label: 'Clientes', icon: <Users size={20} />, href: `/workspaces/${workspaceId}/invoices` },
      ]
    : [
        { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        { id: 'analytics', label: 'Análises', icon: <BarChart3 size={20} />, href: '/analytics' },
        { id: 'deals', label: 'Meus negócios', icon: <Briefcase size={20} />, href: '/deals' },
        { id: 'customers', label: 'Clientes', icon: <Users size={20} />, href: '/customers' },
      ];

  const toolItems: MenuItem[] = [
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, href: '/settings' },
    { id: 'help', label: 'Ajuda', icon: <HelpCircle size={20} />, href: '/help' },
  ];

  return (
    <aside className="w-64 bg-[#1a1a1f] border-r border-gray-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="inline-flex items-center">
          <Image src="/logo-white.svg" alt="NOMA" width={141} height={29} className="h-7 w-auto" priority />
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#25252b] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#25252b]'
                }
              `}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Tools Section */}
        <div className="pt-6">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Ferramentas
          </h3>
          {toolItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#25252b] transition-all"
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#25252b] transition-all w-full">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
