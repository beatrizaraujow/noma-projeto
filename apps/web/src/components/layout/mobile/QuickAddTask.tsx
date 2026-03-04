'use client';

import { useState } from 'react';
import { MobileModal, TouchButton, TouchIconButton } from './';
import { motion } from 'framer-motion';

interface QuickAddTaskProps {
  onAdd: (task: { title: string; priority: string }) => void;
}

export function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title, priority });
      setTitle('');
      setPriority('medium');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* FAB Trigger */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center lg:hidden"
        aria-label="Adicionar task rápida"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {/* Quick Add Modal */}
      <MobileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nova Task"
        fullScreen={false}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Título da Task
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implementar login"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-base"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Prioridade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
                { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
                { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`
                    py-3 px-4 rounded-lg font-medium transition-all text-base
                    ${priority === p.value ? `${p.color} ring-2 ring-offset-2 ring-current` : 'bg-gray-100 dark:bg-gray-800'}
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <TouchButton
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </TouchButton>
            <TouchButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={!title.trim()}
            >
              Adicionar
            </TouchButton>
          </div>
        </form>
      </MobileModal>
    </>
  );
}
