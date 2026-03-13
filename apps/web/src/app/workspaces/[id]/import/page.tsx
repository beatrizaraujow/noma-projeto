'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button } from '@/components/common';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ImportEntity = 'projects' | 'tasks' | 'customers';

type ImportResult = {
  entity: ImportEntity;
  workspaceId: string;
  totalRows: number;
  importedRows: number;
  rejectedRows: number;
  errors: Array<{
    row: number;
    column?: string;
    value?: string;
    message: string;
  }>;
};

export default function WorkspaceImportPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { data: session } = useSession();

  const token = (session as any)?.accessToken || '';

  const [entity, setEntity] = useState<ImportEntity>('projects');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const canSubmit = useMemo(() => Boolean(file && token && workspaceId), [file, token, workspaceId]);

  const handleDownloadTemplate = async () => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/imports/template?entity=${entity}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao baixar template');
      }

      const body = await response.json();
      const csv = body?.csv || '';

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entity}-template.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Selecione um arquivo CSV');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/api/imports/csv?entity=${entity}&workspaceId=${encodeURIComponent(workspaceId)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || 'Falha ao importar CSV');
      }

      setResult(body as ImportResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16161a] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="p-6 bg-[#1a1a1f] border-gray-800">
          <h1 className="text-2xl font-semibold mb-2">Importar CSV</h1>
          <p className="text-gray-400 text-sm mb-6">
            Importe dados em lote para {entity}. Baixe o template, preencha e envie o arquivo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Entidade</label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value as ImportEntity)}
                className="w-full rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2"
              >
                <option value="projects">Projects</option>
                <option value="tasks">Tasks</option>
                <option value="customers">Customers</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">Arquivo CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="ghost" onClick={handleDownloadTemplate} disabled={!token || loading}>
              Baixar template CSV
            </Button>
            <Button onClick={handleImport} disabled={!canSubmit || loading}>
              {loading ? 'Importando...' : 'Importar CSV'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </Card>

        {result && (
          <Card className="p-6 bg-[#1a1a1f] border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Resultado da importacao</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border border-gray-700 bg-[#25252b] p-3">
                <p className="text-xs text-gray-400">Linhas totais</p>
                <p className="text-xl font-semibold">{result.totalRows}</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-[#25252b] p-3">
                <p className="text-xs text-gray-400">Importadas</p>
                <p className="text-xl font-semibold text-green-400">{result.importedRows}</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-[#25252b] p-3">
                <p className="text-xs text-gray-400">Rejeitadas</p>
                <p className="text-xl font-semibold text-red-400">{result.rejectedRows}</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-[#25252b] p-3">
                <p className="text-xs text-gray-400">Entidade</p>
                <p className="text-xl font-semibold">{result.entity}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="text-left py-2 pr-3">Linha</th>
                      <th className="text-left py-2 pr-3">Coluna</th>
                      <th className="text-left py-2 pr-3">Valor</th>
                      <th className="text-left py-2">Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 50).map((item, index) => (
                      <tr key={`${item.row}-${index}`} className="border-b border-gray-800">
                        <td className="py-2 pr-3">{item.row}</td>
                        <td className="py-2 pr-3">{item.column || '-'}</td>
                        <td className="py-2 pr-3 text-gray-400">{item.value || '-'}</td>
                        <td className="py-2 text-red-300">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
