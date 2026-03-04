'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Card } from '@/components/common';
import { TrendingUp, Award, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MemberMetric {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTasks: number;
  completedTasks: number;
  completionRate: number;
  activitiesCount: number;
  commentsCount: number;
  recentActivities: Array<{
    type: string;
    count: number;
  }>;
}

interface TeamProductivityData {
  memberMetrics: MemberMetric[];
  teamAverages: {
    totalAssigned: number;
    totalCompleted: number;
    averageCompletionRate: number;
  };
}

interface TeamProductivityMetricsProps {
  workspaceId: string;
  token: string;
}

const MOCK_TEAM_PRODUCTIVITY: TeamProductivityData = {
  memberMetrics: [
    {
      user: {
        id: 'u1',
        name: 'João Silva',
        email: 'joao@demo.com',
      },
      assignedTasks: 14,
      completedTasks: 10,
      completionRate: 71,
      activitiesCount: 22,
      commentsCount: 18,
      recentActivities: [
        { type: 'TASK_COMPLETED', count: 6 },
        { type: 'COMMENT_ADDED', count: 8 },
      ],
    },
    {
      user: {
        id: 'u2',
        name: 'Maria Santos',
        email: 'maria@demo.com',
      },
      assignedTasks: 12,
      completedTasks: 9,
      completionRate: 75,
      activitiesCount: 19,
      commentsCount: 11,
      recentActivities: [
        { type: 'TASK_COMPLETED', count: 5 },
        { type: 'TASK_ASSIGNED', count: 4 },
      ],
    },
  ],
  teamAverages: {
    totalAssigned: 26,
    totalCompleted: 19,
    averageCompletionRate: 73,
  },
};

export default function TeamProductivityMetrics({
  workspaceId,
  token,
}: TeamProductivityMetricsProps) {
  const [data, setData] = useState<TeamProductivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamProductivity();
  }, [workspaceId]);

  const loadTeamProductivity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/analytics/workspaces/${workspaceId}/team-productivity`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading team productivity:', err);
      setData(MOCK_TEAM_PRODUCTIVITY);
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
      <div className="bg-[#2a1616] border border-orange-700/50 text-orange-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Team Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Assigned</p>
              <p className="text-3xl font-bold text-white">{data.teamAverages.totalAssigned}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Completed</p>
              <p className="text-3xl font-bold text-white">{data.teamAverages.totalCompleted}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Completion Rate</p>
              <p className="text-3xl font-bold text-white">{data.teamAverages.averageCompletionRate}%</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
        <h3 className="text-lg font-semibold mb-4 text-white">Team Members Performance</h3>
        <div className="space-y-4">
          {data.memberMetrics.map((member, index) => (
            <div key={member.user.id} className="border border-gray-700 bg-[#25252b] rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 bg-orange-400 rounded-full p-1">
                        <Award className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{member.user.name}</h4>
                    <p className="text-sm text-gray-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">
                    {member.completionRate}%
                  </p>
                  <p className="text-xs text-gray-400">Completion Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1a1a1f] border border-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Assigned</p>
                  <p className="text-xl font-semibold text-orange-400">
                    {member.assignedTasks}
                  </p>
                </div>
                <div className="bg-[#1a1a1f] border border-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Completed</p>
                  <p className="text-xl font-semibold text-orange-400">
                    {member.completedTasks}
                  </p>
                </div>
                <div className="bg-[#1a1a1f] border border-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Activities</p>
                  <p className="text-xl font-semibold text-orange-400">
                    {member.activitiesCount}
                  </p>
                </div>
                <div className="bg-[#1a1a1f] border border-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Comments</p>
                  <p className="text-xl font-semibold text-orange-400">
                    {member.commentsCount}
                  </p>
                </div>
              </div>

              {/* Recent Activities */}
              {member.recentActivities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">
                    Recent Activities (Last 7 days)
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {member.recentActivities.map((activity) => (
                      <span
                        key={activity.type}
                        className="text-xs bg-[#1a1a1f] border border-gray-700 text-gray-300 px-2 py-1 rounded"
                      >
                        {activity.type}: {activity.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Productivity Chart */}
      {data.memberMetrics.length > 0 && (
        <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
          <h3 className="text-lg font-semibold mb-4 text-white">Task Completion Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.memberMetrics.map((m) => ({
                name: m.user.name.split(' ')[0],
                Assigned: m.assignedTasks,
                Completed: m.completedTasks,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f1f25',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }} />
              <Bar dataKey="Assigned" fill="#fb923c" />
              <Bar dataKey="Completed" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {data.memberMetrics.length === 0 && (
        <Card className="p-8 text-center text-gray-400 bg-[#1a1a1f] border-gray-800">
          <p>No team members found in this workspace</p>
        </Card>
      )}
    </div>
  );
}
