'use client';

import React from 'react';
import { Badge, Button, Input, Dropdown } from '@/components/common';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users,
  Search,
  Mail,
  Calendar,
  Save,
  Trash,
  Edit
} from 'lucide-react';

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-[#16161a] p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-white text-4xl font-bold mb-2">Components Showcase</h1>
          <p className="text-gray-400">Todos os componentes do sistema de design</p>
        </div>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Badges</h2>
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Variantes:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Tamanhos:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Buttons</h2>
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Variantes:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Danger</Button>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Tamanhos:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Com ícones:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">
                    <Save size={16} className="mr-2" />
                    Salvar
                  </Button>
                  <Button variant="destructive">
                    <Trash size={16} className="mr-2" />
                    Deletar
                  </Button>
                  <Button variant="secondary">
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Estados:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" disabled>Disabled</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Inputs</h2>
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Email"
                type="email"
                placeholder="seu@email.com"
                icon={<Mail size={16} />}
              />
              
              <Input 
                label="Buscar"
                type="text"
                placeholder="Digite para buscar..."
                icon={<Search size={16} />}
              />

              <Input 
                label="Nome"
                type="text"
                placeholder="Seu nome completo"
              />

              <Input 
                label="Com erro"
                type="text"
                placeholder="Campo inválido"
                error="Este campo é obrigatório"
              />
            </div>
          </div>
        </section>

        {/* Dropdowns */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Dropdowns</h2>
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dropdown
                options={[
                  { value: 'today', label: 'Today', icon: <Calendar size={16} /> },
                  { value: 'week', label: 'This Week', icon: <Calendar size={16} /> },
                  { value: 'month', label: 'This Month', icon: <Calendar size={16} /> },
                ]}
                placeholder="Select period"
              />

              <Dropdown
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'active', label: 'Active Users' },
                  { value: 'inactive', label: 'Inactive Users' },
                ]}
                placeholder="Filter by status"
              />

              <Dropdown
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'name', label: 'By Name' },
                ]}
                placeholder="Sort by"
              />
            </div>
          </div>
        </section>

        {/* Metric Cards Grid */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Metric Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
              <div className="bg-gray-800 text-white p-3 rounded-lg w-fit mb-4">
                <DollarSign size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Revenue</h3>
              <div className="flex items-end gap-3">
                <span className="text-white text-3xl font-bold">$136,755</span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400">
                  <TrendingUp size={14} />
                  <span className="text-xs font-semibold">12%</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">In the current top</p>
            </div>

            <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
              <div className="bg-purple-500/20 text-purple-500 p-3 rounded-lg w-fit mb-4">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Orders</h3>
              <div className="flex items-end gap-3">
                <span className="text-white text-3xl font-bold">1,497</span>
                <Badge variant="info" size="sm">+8%</Badge>
              </div>
            </div>

            <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
              <div className="bg-orange-500/20 text-orange-500 p-3 rounded-lg w-fit mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">New Customers</h3>
              <span className="text-white text-3xl font-bold">630</span>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-lg w-fit mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-purple-300 text-sm font-medium mb-2">Growth Rate</h3>
              <span className="text-white text-3xl font-bold">+24%</span>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Color Palette</h2>
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="bg-[#16161a] h-20 rounded-lg border border-gray-700"></div>
                <p className="text-gray-400 text-sm">Background</p>
                <code className="text-xs text-purple-400">#16161a</code>
              </div>
              
              <div className="space-y-2">
                <div className="bg-[#1a1a1f] h-20 rounded-lg border border-gray-700"></div>
                <p className="text-gray-400 text-sm">Card</p>
                <code className="text-xs text-purple-400">#1a1a1f</code>
              </div>

              <div className="space-y-2">
                <div className="bg-purple-600 h-20 rounded-lg"></div>
                <p className="text-gray-400 text-sm">Primary</p>
                <code className="text-xs text-purple-400">#8b5cf6</code>
              </div>

              <div className="space-y-2">
                <div className="bg-orange-500 h-20 rounded-lg"></div>
                <p className="text-gray-400 text-sm">Accent</p>
                <code className="text-xs text-purple-400">#f97316</code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
