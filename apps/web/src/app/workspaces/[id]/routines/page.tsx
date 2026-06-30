'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Plus, CheckSquare, Square, ChevronLeft, ChevronRight, X, BarChart2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface Routine {
  id: string;
  title: string;
  description?: string;
  frequency: Frequency;
  order: number;
  completedByMe: boolean;
}

interface RoutineMetric {
  routine: Routine;
  completionRate: number;
  completedBy: { userId: string; name: string; completedAt: string }[];
}

const FREQ_LABELS: Record<Frequency, string> = { DAILY: 'Diário', WEEKLY: 'Semanal', MONTHLY: 'Mensal' };

function getPeriodKey(frequency: Frequency, offset = 0): string {
  const now = new Date();
  if (frequency === 'DAILY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }
  if (frequency === 'WEEKLY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset * 7);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getPeriodLabel(frequency: Frequency, offset = 0): string {
  const now = new Date();
  if (frequency === 'DAILY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
  }
  if (frequency === 'WEEKLY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset * 7);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function getDateRange(frequency: Frequency, offset = 0): { start: string; end: string } {
  const now = new Date();
  if (frequency === 'DAILY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const s = d.toISOString().slice(0, 10);
    return { start: s, end: s };
  }
  if (frequency === 'WEEKLY') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset * 7);
    const mon = new Date(d);
    mon.setDate(d.getDate() - d.getDay() + 1);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { start: mon.toISOString().slice(0, 10), end: sun.toISOString().slice(0, 10) };
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: d.toISOString().slice(0, 10), end: last.toISOString().slice(0, 10) };
}

export default function RoutinesPage() {
  const params = useParams();
  const workspaceId = Array.isArray(params?.id) ? params.id[0] : params?.id as string;
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const userRole = (session as any)?.workspace?.role ?? 'MEMBER';
  const isAdmin = ['OWNER', 'ADMIN'].includes(userRole);

  const [frequency, setFrequency] = useState<Frequency>('WEEKLY');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [metrics, setMetrics] = useState<RoutineMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mine' | 'all'>('mine');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFreq, setNewFreq] = useState<Frequency>('WEEKLY');
  const [saving, setSaving] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const loadRoutines = useCallback(async () => {
    if (!token || !workspaceId) return;
    setLoading(true);
    try {
      const [routinesRes, { start, end }] = await Promise.all([
        axios.get(`${API_URL}/routines?workspaceId=${workspaceId}`, { headers }),
        Promise.resolve(getDateRange(frequency, periodOffset)),
      ]);
      setRoutines(routinesRes.data ?? []);

      const metricsRes = await axios.get(
        `${API_URL}/routines/metrics?workspaceId=${workspaceId}&period=${frequency}&start=${start}&end=${end}`,
        { headers }
      );
      setMetrics(metricsRes.data ?? []);
    } catch {
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, frequency, periodOffset]);

  useEffect(() => { loadRoutines(); }, [loadRoutines]);

  const toggleComplete = async (routine: Routine) => {
    const periodKey = getPeriodKey(routine.frequency, periodOffset);
    try {
      if (routine.completedByMe) {
        await axios.delete(`${API_URL}/routines/${routine.id}/complete?periodKey=${periodKey}`, { headers });
      } else {
        await axios.post(`${API_URL}/routines/${routine.id}/complete`, { periodKey }, { headers });
      }
      setRoutines((prev) => prev.map((r) => r.id === routine.id ? { ...r, completedByMe: !r.completedByMe } : r));
    } catch {}
  };

  const createRoutine = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API_URL}/routines?workspaceId=${workspaceId}`, { title: newTitle, description: newDesc, frequency: newFreq }, { headers });
      setShowNewModal(false);
      setNewTitle(''); setNewDesc('');
      loadRoutines();
    } catch {} finally {
      setSaving(false);
    }
  };

  const displayedRoutines = tab === 'mine'
    ? routines.filter((r) => r.frequency === frequency)
    : routines;

  const completedCount = displayedRoutines.filter((r) => r.completedByMe).length;
  const completionPct = displayedRoutines.length > 0
    ? Math.round((completedCount / displayedRoutines.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Rotinas</h1>
        {isAdmin && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nova Rotina
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex bg-[#25252b] rounded-lg p-1">
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as Frequency[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFrequency(f); setPeriodOffset(0); }}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${frequency === f ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setPeriodOffset((o) => o - 1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#25252b] rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-300 min-w-[160px] text-center capitalize">
            {getPeriodLabel(frequency, periodOffset)}
          </span>
          <button onClick={() => setPeriodOffset((o) => o + 1)} disabled={periodOffset >= 0} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#25252b] rounded-lg transition-colors disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Metrics card */}
      <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-orange-400" />
            <span className="text-sm font-semibold text-gray-300">Progresso do Período</span>
          </div>
          <span className="text-2xl font-bold text-white">{completionPct}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{completedCount} de {displayedRoutines.length} rotinas concluídas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#25252b] rounded-lg p-1 w-fit">
        <button onClick={() => setTab('mine')} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${tab === 'mine' ? 'bg-[#1a1a1f] text-white' : 'text-gray-400 hover:text-white'}`}>
          Minhas Rotinas
        </button>
        {isAdmin && (
          <button onClick={() => setTab('all')} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${tab === 'all' ? 'bg-[#1a1a1f] text-white' : 'text-gray-400 hover:text-white'}`}>
            Todas
          </button>
        )}
      </div>

      {/* Routines list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : displayedRoutines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckSquare size={36} className="mx-auto mb-3 text-gray-700" />
          <p>Nenhuma rotina cadastrada ainda.</p>
          {isAdmin && <p className="text-sm mt-1">Clique em "+ Nova Rotina" para começar.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedRoutines.map((routine) => (
            <div key={routine.id} className={`flex items-center gap-4 bg-[#1a1a1f] border rounded-xl px-4 py-3 transition-colors ${routine.completedByMe ? 'border-green-800/50' : 'border-gray-800'}`}>
              <button onClick={() => toggleComplete(routine)} className="shrink-0 transition-colors">
                {routine.completedByMe
                  ? <CheckSquare size={20} className="text-green-500" />
                  : <Square size={20} className="text-gray-500 hover:text-gray-300" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${routine.completedByMe ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {routine.title}
                </p>
                {routine.description && <p className="text-xs text-gray-500 truncate">{routine.description}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${routine.completedByMe ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                {routine.completedByMe ? 'Concluída' : 'Pendente'}
              </span>
              <span className="text-xs text-gray-600 shrink-0">{FREQ_LABELS[routine.frequency]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics details */}
      {metrics.length > 0 && tab === 'all' && isAdmin && (
        <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-orange-400" /> Taxa de Conclusão por Rotina
          </h3>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.routine.id}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{m.routine.title}</span>
                  <span className="font-medium text-white">{m.completionRate}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                    style={{ width: `${m.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New routine modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Nova Rotina</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Título *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Verificar métricas do dia"
                  className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Frequência</label>
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value as Frequency)}
                  className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="DAILY">Diário</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensal</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancelar</button>
                <button
                  onClick={createRoutine}
                  disabled={saving || !newTitle.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
