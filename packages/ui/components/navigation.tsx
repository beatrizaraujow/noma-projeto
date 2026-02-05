import * as React from 'react';
import { 
  Home, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Button } from './button';
import { Badge } from './badge';

// Sidebar Component
export interface SidebarProps {
  children?: React.ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, collapsed = false, onCollapsedChange, className }, ref) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    return (
      <>
        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={cn(
            'fixed top-4 left-4 z-50 p-2 rounded-lg',
            'bg-white dark:bg-neutral-800',
            'border border-neutral-200 dark:border-neutral-700',
            'shadow-md lg:hidden'
          )}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Sidebar */}
        <aside
          ref={ref}
          className={cn(
            'fixed top-0 left-0 z-40 h-screen',
            'bg-white dark:bg-neutral-900',
            'border-r border-neutral-200 dark:border-neutral-800',
            'transition-all duration-300',
            'flex flex-col',
            // Desktop
            collapsed ? 'lg:w-20' : 'lg:w-64',
            // Mobile
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="font-semibold text-lg">NOMA</span>
              </div>
            )}
            {collapsed && (
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => onCollapsedChange?.(!collapsed)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hidden lg:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {children}
          </div>

          {/* Footer - Collapse button for collapsed state */}
          {collapsed && (
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => onCollapsedChange?.(!collapsed)}
                className="w-full p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Menu className="h-5 w-5 mx-auto" />
              </button>
            </div>
          )}
        </aside>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// Sidebar Item
export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
  collapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ icon, label, active, badge, collapsed, onClick, className }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
        'transition-colors text-sm font-medium',
        active
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        collapsed && 'justify-center',
        className
      )}
      title={collapsed ? label : undefined}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge && (
            <Badge size="sm" variant={active ? 'primary' : 'neutral'}>
              {badge}
            </Badge>
          )}
        </>
      )}
    </button>
  )
);

SidebarItem.displayName = 'SidebarItem';

// Sidebar Section
export interface SidebarSectionProps {
  title?: string;
  collapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SidebarSection = ({
  title,
  collapsed,
  children,
  className,
}: SidebarSectionProps) => (
  <div className={cn('mb-6', className)}>
    {title && !collapsed && (
      <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {title}
      </div>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

SidebarSection.displayName = 'SidebarSection';

// Topbar Component
export interface TopbarProps {
  children?: React.ReactNode;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  onSearch?: (value: string) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  notifications?: number;
  className?: string;
}

const Topbar = React.forwardRef<HTMLDivElement, TopbarProps>(
  ({ children, user, onSearch, onProfileClick, onLogout, notifications = 0, className }, ref) => {
    const [searchValue, setSearchValue] = React.useState('');

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-30',
          'h-16 px-4 lg:px-6',
          'bg-white dark:bg-neutral-900',
          'border-b border-neutral-200 dark:border-neutral-800',
          'flex items-center justify-between gap-4',
          className
        )}
      >
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1">
          {children}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search - Hidden on mobile */}
          {onSearch && (
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSearch(searchValue);
                    }
                  }}
                  placeholder="Search..."
                  className={cn(
                    'w-64 h-9 pl-9 pr-3 rounded-lg',
                    'bg-neutral-100 dark:bg-neutral-800',
                    'border border-transparent',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-neutral-900',
                    'placeholder:text-neutral-500',
                    'text-sm'
                  )}
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-error text-white text-xs font-medium rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <Avatar
                src={user.avatar}
                fallback={user.name}
                size="sm"
                className="cursor-pointer"
                onClick={onProfileClick}
              />
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user.name}
                </div>
                {user.email && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user.email}
                  </div>
                )}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
);

Topbar.displayName = 'Topbar';

export { Sidebar, SidebarItem, SidebarSection, Topbar };
