'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/common';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type SignupMetricsResponse = {
  periodDays: number;
  totalSignups: number;
  byMethod: {
    email: number;
    google: number;
    unknown: number;
  };
  bySource: Array<{
    source: string;
    count: number;
  }>;
  daily: Array<{
    date: string;
    count: number;
  }>;
  activationFunnel: {
    signedUp: number;
    createdProject: number;
    firstTaskEngaged: number;
    activationRate: number;
  };
};

interface SignupMetricsWidgetProps {
  workspaceId: string;
  token: string;
}

export default function SignupMetricsWidget({ workspaceId, token }: SignupMetricsWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<SignupMetricsResponse | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!token) {
        if (active) {
          setLoading(false);
          setError('Sessao sem token para carregar metricas de cadastro.');
        }
        return;
      }

      try {
        const response = await axios.get<SignupMetricsResponse>(
          `${API_URL}/api/analytics/workspaces/${workspaceId}/signups?days=30`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) {
          return;
        }

        setMetrics(response.data);
        setError('');
      } catch {
        if (active) {
          setError('Nao foi possivel carregar metricas de cadastro.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [workspaceId, token]);

  const recentDaily = useMemo(() => {
    if (!metrics?.daily) {
      return [];
    }

    return metrics.daily.slice(-7);
  }, [metrics]);

  const peakDaily = useMemo(() => {
    if (!recentDaily.length) {
      return 0;
    }

    return Math.max(...recentDaily.map((item) => item.count));
  }, [recentDaily]);

  return (
    <Card className="p-5 bg-[#1a1a1f] border-gray-800 text-white shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Novos Cadastros</h3>
          <p className="text-sm text-gray-400">Ultimos 30 dias no workspace</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">{metrics?.totalSignups ?? '-'}</p>
          <p className="text-xs text-gray-400">novos usuarios</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Carregando metricas...</p>}

      {!loading && error && (
        <p className="text-sm text-red-300 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {!loading && !error && metrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-lg font-semibold text-white">{metrics.byMethod.email}</p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2">
              <p className="text-xs text-gray-400">Google</p>
              <p className="text-lg font-semibold text-white">{metrics.byMethod.google}</p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2">
              <p className="text-xs text-gray-400">Outros</p>
              <p className="text-lg font-semibold text-white">{metrics.byMethod.unknown}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-[#25252b] px-3 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-300">Ativacao (1a tarefa)</p>
              <p className="text-sm font-semibold text-orange-300">{metrics.activationFunnel.activationRate}%</p>
            </div>
            <p className="text-xs text-gray-400">
              {metrics.activationFunnel.firstTaskEngaged}/{metrics.activationFunnel.signedUp} usuarios engajaram com tarefa
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-300 mb-2">Cadastros por dia (7d)</p>
            <div className="space-y-1.5">
              {recentDaily.length === 0 && (
                <p className="text-xs text-gray-500">Sem cadastros recentes.</p>
              )}
              {recentDaily.map((item) => {
                const width = peakDaily > 0 ? Math.max((item.count / peakDaily) * 100, 8) : 8;
                return (
                  <div key={item.date} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 w-20">{item.date.slice(5)}</span>
                    <div className="h-2 flex-1 rounded bg-[#32323a] overflow-hidden">
                      <div className="h-full bg-orange-500 rounded" style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-300 w-5 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
