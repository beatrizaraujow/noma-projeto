import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NexORA
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Enterprise Task Management Platform
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Gerenciamento avançado de projetos e tarefas com colaboração em tempo real, 
            automação inteligente e recursos enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">🚀 Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Colaboração em tempo real com Socket.io e WebSockets
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">🤖 IA Integrada</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sugestões inteligentes com OpenAI e automação avançada
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboards e métricas em tempo real para decisões estratégicas
            </p>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg">
              Acessar Dashboard
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="outline" className="text-lg">
              Documentação
            </Button>
          </Link>
        </div>

        <div className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Tecnologias Principais</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Frontend:</strong> Next.js 14, React 18, TypeScript
            </div>
            <div>
              <strong>Backend:</strong> NestJS, GraphQL, REST
            </div>
            <div>
              <strong>Database:</strong> PostgreSQL, MongoDB, Redis
            </div>
            <div>
              <strong>Search:</strong> Elasticsearch
            </div>
            <div>
              <strong>Real-time:</strong> Socket.io, WebSockets
            </div>
            <div>
              <strong>Auth:</strong> NextAuth.js, JWT
            </div>
            <div>
              <strong>UI:</strong> Tailwind CSS, Shadcn/ui
            </div>
            <div>
              <strong>DevOps:</strong> Docker, Kubernetes
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
