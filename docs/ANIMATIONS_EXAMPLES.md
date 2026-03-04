# 🎨 Exemplos de Integração - Micro-interactions

## Exemplo 1: Página de Login Animada

```tsx
'use client';

import { useState } from 'react';
import { AnimatedButton, PageTransition, SuccessToast } from '@/components/animations';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <PageTransition variant="fade">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Bem-vindo ao NOMA
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <AnimatedButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </AnimatedButton>
          </form>
        </motion.div>
      </div>

      <SuccessToast
        message="Login realizado com sucesso!"
        show={showSuccess}
        withConfetti={true}
        onClose={() => setShowSuccess(false)}
      />
    </PageTransition>
  );
}
```

## Exemplo 2: Lista de Tasks com Drag & Drop

```tsx
'use client';

import { useState } from 'react';
import { AnimatedCard, SortableItem, DragHandle, SkeletonList } from '@/components/animations';
import { motion } from 'framer-motion';
import { staggerContainerVariants, listItemVariants } from '@/components/animations/variants';

export function TaskList() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Implementar autenticação', status: 'doing' },
    { id: '2', title: 'Criar dashboard', status: 'todo' },
    { id: '3', title: 'Testes unitários', status: 'todo' },
  ]);

  if (loading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonList items={3} />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <h2 className="text-2xl font-bold mb-6">Minhas Tasks</h2>
      
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {tasks.map((task) => (
          <SortableItem
            key={task.id}
            id={task.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <DragHandle />
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <span className="text-sm text-gray-500">{task.status}</span>
              </div>
            </div>
          </SortableItem>
        ))}
      </motion.div>
    </AnimatedCard>
  );
}
```

## Exemplo 3: Dashboard com Cards Animados

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatedCard, PageTransition, SkeletonDashboard } from '@/components/animations';
import { motion } from 'framer-motion';
import { staggerContainerVariants, listItemVariants } from '@/components/animations/variants';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { label: 'Total Tasks', value: '156', change: '+12%', trend: 'up' },
    { label: 'Completed', value: '89', change: '+8%', trend: 'up' },
    { label: 'In Progress', value: '45', change: '-3%', trend: 'down' },
    { label: 'Team Members', value: '12', change: '+2', trend: 'up' },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <SkeletonDashboard />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div key={index} variants={listItemVariants}>
              <AnimatedCard hoverable className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <p className={`text-sm mt-2 ${
                      metric.trend === 'up' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      metric.trend === 'up'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {metric.trend === 'up' ? '↑' : '↓'}
                  </motion.div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}
```

## Exemplo 4: Modal com Animações

```tsx
'use client';

import { useState } from 'react';
import { AnimatedButton } from '@/components/animations';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatedButton onClick={() => setIsOpen(true)}>
        Abrir Modal
      </AnimatedButton>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Título do Modal</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Conteúdo do modal com animação suave
                </p>
                <div className="flex gap-3 justify-end">
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Confirmar
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

## Exemplo 5: Formulário com Validação Animada

```tsx
'use client';

import { useState } from 'react';
import { AnimatedButton, SuccessCheckmark } from '@/components/animations';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: '' });
          }}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            errors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        <AnimatePresence>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setErrors({ ...errors, email: '' });
          }}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <AnimatedButton type="submit" variant="primary">
          Enviar
        </AnimatedButton>
        
        <SuccessCheckmark show={success} size={40} />
      </div>
    </form>
  );
}
```

## Exemplo 6: Notificação Toast Personalizada

```tsx
'use client';

import { useState } from 'react';
import { AnimatedButton } from '@/components/animations';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export function ToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div>
      <div className="flex gap-2">
        <AnimatedButton onClick={() => addToast('success', 'Sucesso!')}>
          Success
        </AnimatedButton>
        <AnimatedButton onClick={() => addToast('error', 'Erro!')}>
          Error
        </AnimatedButton>
        <AnimatedButton onClick={() => addToast('warning', 'Atenção!')}>
          Warning
        </AnimatedButton>
        <AnimatedButton onClick={() => addToast('info', 'Informação!')}>
          Info
        </AnimatedButton>
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`${colors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px]`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

## 🎯 Dicas de Implementação

1. **Combine animações**: Use múltiplas animações juntas para criar experiências ricas
2. **Performance**: Utilize `layout` animations do Framer Motion para animações mais suaves
3. **Timing**: Mantenha animações curtas (200-400ms) para não frustrar usuários
4. **Propósito**: Cada animação deve ter um propósito claro (feedback, affordance, etc)
5. **Consistência**: Use as mesmas durações e easing em toda a aplicação
