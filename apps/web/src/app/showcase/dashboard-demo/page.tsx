'use client';

import React, { useState } from 'react';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard, SalesChart, MonthlyProfitCard, MonthlySalesCard, OrdersTable } from '@/components/features/dashboard';
import { 
  DollarSign, 
  TrendingDown, 
  ShoppingCart, 
  Users 
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('value-comparison');

  const tabs = [
    { id: 'value-comparison', label: 'Value comparison', active: activeTab === 'value-comparison' },
    { id: 'average-values', label: 'Average values', active: activeTab === 'average-values' },
    { id: 'configure-analysis', label: 'Configure analysis', active: activeTab === 'configure-analysis' },
    { id: 'filter-analysis', label: 'Filter analysis', active: activeTab === 'filter-analysis' },
  ];

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        
        <MainContent>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Total cost"
              value="$136,755"
              trend={{ value: 12.5, direction: 'up' }}
              subtitle="In the current top"
              icon={<DollarSign size={20} />}
              iconBgColor="bg-gray-800"
              iconColor="text-white"
            />
            
            <MetricCard
              title="Expenses total"
              value="$12,935"
              trend={{ value: 8.3, direction: 'down' }}
              subtitle="In the current top"
              icon={<TrendingDown size={20} />}
              iconBgColor="bg-orange-500/20"
              iconColor="text-orange-500"
            />
            
            <MetricCard
              title="Total orders"
              value="1497"
              trend={{ value: 5.7, direction: 'up' }}
              subtitle="In the current top"
              icon={<ShoppingCart size={20} />}
              iconBgColor="bg-gray-800"
              iconColor="text-white"
            />
            
            <MetricCard
              title="New customers"
              value="630"
              trend={{ value: 15.2, direction: 'up' }}
              subtitle="In the current top"
              icon={<Users size={20} />}
              iconBgColor="bg-purple-500/20"
              iconColor="text-purple-500"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <SalesChart />
            </div>

            {/* Monthly Profit */}
            <div>
              <MonthlyProfitCard />
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Orders Table - Takes 2 columns */}
            <div className="lg:col-span-2">
              <OrdersTable />
            </div>

            {/* Monthly Sales */}
            <div>
              <MonthlySalesCard />
            </div>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
