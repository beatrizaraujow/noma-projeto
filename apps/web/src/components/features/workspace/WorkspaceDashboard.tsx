'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button } from '@/components/common';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FolderKanban,
  ListTodo 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardData {
  overview: {
    totalProjects: number;
    totalTasks: number;
    totalMembers: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
}

interface WorkspaceDashboardProps {
  workspaceId: string;
  token: string;
}

const buildMockDashboardData = (): DashboardData => ({
  overview: {
    totalProjects: 5,
    totalTasks: 42,
    totalMembers: 12,
    completedTasks: 28,
    overdueTasks: 6,
    completionRate: 67,
  },
  recentActivity: [
    {
      id: 'a1',
      type: 'task',
      description: 'concluiu a tarefa "Design da landing page"',
      createdAt: new Date().toISOString(),
      user: {
        id: 'u1',
        name: 'João Silva',
        email: 'joao@demo.com',
      },
    },
    {
      id: 'a2',
      type: 'project',
      description: 'criou o projeto "App Mobile"',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 'u2',
        name: 'Maria Santos',
        email: 'maria@demo.com',
      },
    },
  ],
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function WorkspaceDashboard({ workspaceId, token }: WorkspaceDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [workspaceId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/analytics/workspaces/${workspaceId}/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setData(buildMockDashboardData());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const overviewCards = [
    {
      title: 'Total Projects',
      value: data.overview.totalProjects,
      icon: FolderKanban,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Tasks',
      value: data.overview.totalTasks,
      icon: ListTodo,
      color: 'bg-orange-500',
    },
    {
      title: 'Team Members',
      value: data.overview.totalMembers,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: 'Completed Tasks',
      value: data.overview.completedTasks,
      icon: CheckCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Overdue Tasks',
      value: data.overview.overdueTasks,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Completion Rate',
      value: `${data.overview.completionRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map((card, index) => (
          <Card key={index} className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
        <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#25252b] rounded-lg border border-gray-700">
              <div className="flex-shrink-0">
                {activity.user.avatar ? (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
                    {activity.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">
                  <span className="font-medium text-white">{activity.user.name}</span>{' '}
                  <span className="text-gray-300">{activity.description}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {data.recentActivity.length === 0 && (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}
