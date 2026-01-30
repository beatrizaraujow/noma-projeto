import { Card } from '@nexora/ui';
import { cn } from '@/lib/utils';
import { responsive } from '@/hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente de exemplo demonstrando uso de classes responsive
 * e utilitários do sistema
 */
export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Container adaptativo */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Card responsivo de exemplo
 */
export function ResponsiveCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-4 md:p-6">
      {/* Título responsivo */}
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">
        {title}
      </h3>
      
      {/* Descrição com truncate em mobile */}
      <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3">
        {description}
      </p>
      
      {/* Botões responsivos */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button className="btn-primary text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
          Ver Detalhes
        </button>
        <button className="btn-secondary text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
          Editar
        </button>
      </div>
    </Card>
  );
}

/**
 * Navegação responsiva de exemplo
 */
export function ResponsiveNav() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="text-xl md:text-2xl font-bold">
            NUMA
          </div>
          
          {/* Menu desktop */}
          <div className={responsive.desktop}>
            <ul className="flex items-center gap-6">
              <li><a href="/projects">Projetos</a></li>
              <li><a href="/tasks">Tarefas</a></li>
              <li><a href="/team">Equipe</a></li>
            </ul>
          </div>
          
          {/* Menu mobile */}
          <div className={responsive.mobile}>
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Sidebar responsiva de exemplo
 */
export function ResponsiveSidebar({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-muted/50 border-r min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </aside>
      
      {/* Mobile Drawer (implementar com Radix Dialog) */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
      </div>
    </>
  );
}

/**
 * Grid de cards responsivo
 */
export function ResponsiveGrid({ items }: { items: any[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, index) => (
        <Card key={index} className="p-3 md:p-4">
          <h4 className="text-sm md:text-base font-medium truncate">
            {item.title}
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        </Card>
      ))}
    </div>
  );
}

/**
 * Classes utilitárias para espaçamento responsivo
 */
export const spacing = {
  // Padding
  p: 'p-4 md:p-6 lg:p-8',
  px: 'px-4 md:px-6 lg:px-8',
  py: 'py-4 md:py-6 lg:py-8',
  
  // Gap
  gap: 'gap-4 md:gap-6 lg:gap-8',
  
  // Margin
  mt: 'mt-4 md:mt-6 lg:mt-8',
  mb: 'mb-4 md:mb-6 lg:mb-8',
};

/**
 * Classes utilitárias para tipografia responsiva
 */
export const typography = {
  h1: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold',
  h2: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold',
  h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
  h4: 'text-base md:text-lg lg:text-xl font-semibold',
  body: 'text-sm md:text-base',
  small: 'text-xs md:text-sm',
};
