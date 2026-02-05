// Core Components
export { Button } from './components/button';
export type { ButtonProps } from './components/button';

export { Card } from './components/card';

// Form Components
export { Input } from './components/input';
export { Label } from './components/label';
export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';

export { Checkbox } from './components/checkbox';
export type { CheckboxProps } from './components/checkbox';

export { Radio } from './components/radio';
export type { RadioProps } from './components/radio';

export { Select } from './components/select';
export type { SelectProps } from './components/select';

// Display Components
export { Badge } from './components/badge';
export type { BadgeProps } from './components/badge';

export { Avatar, AvatarGroup } from './components/avatar';
export type { AvatarProps, AvatarGroupProps } from './components/avatar';

// Loading Components
export { 
  Spinner, 
  Skeleton, 
  LoadingOverlay,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar
} from './components/loading';
export type { 
  SpinnerProps, 
  SkeletonProps, 
  LoadingOverlayProps 
} from './components/loading';

// Overlay Components
export { Tooltip } from './components/tooltip';
export type { TooltipProps } from './components/tooltip';

export { Popover, PopoverContent, PopoverHeader, PopoverFooter } from './components/popover';
export type { PopoverProps } from './components/popover';

// Molecules - Cards
export { 
  Card as CardMolecule,
  ProjectCard,
  TaskCard,
  UserCard
} from './components/cards';
export type { 
  CardProps as CardMoleculeProps,
  ProjectCardProps,
  TaskCardProps,
  UserCardProps
} from './components/cards';

// Molecules - Modals & Dialogs
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dialog,
  ConfirmDialog
} from './components/modal';
export type { 
  ModalProps,
  DialogProps,
  ConfirmDialogProps
} from './components/modal';

// Molecules - Dropdowns & Menus
export {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownSubmenu
} from './components/dropdown';
export type {
  DropdownProps,
  DropdownItemProps
} from './components/dropdown';

// Molecules - Search
export { SearchBar } from './components/search-bar';
export type { SearchBarProps, SearchOption } from './components/search-bar';

// Molecules - Navigation
export {
  Sidebar,
  SidebarItem,
  SidebarSection,
  Topbar
} from './components/navigation';
export type {
  SidebarProps,
  SidebarItemProps,
  SidebarSectionProps,
  TopbarProps
} from './components/navigation';

// Molecules - States
export {
  EmptyState,
  ErrorState,
  InlineError,
  ErrorBanner
} from './components/states';
export type {
  EmptyStateProps,
  ErrorStateProps,
  InlineErrorProps,
  ErrorBannerProps
} from './components/states';

// Organisms - Auth
export {
  AuthContainer,
  AuthCard,
  LoginForm,
  SignupForm,
  ForgotPasswordForm
} from './components/auth-form';
export type {
  AuthContainerProps,
  AuthCardProps,
  LoginFormProps,
  SignupFormProps,
  ForgotPasswordFormProps
} from './components/auth-form';

// Organisms - Onboarding
export {
  OnboardingContainer,
  OnboardingCard,
  WelcomeStep,
  CreateWorkspaceStep,
  InviteTeamStep,
  CreateProjectStep
} from './components/onboarding';
export type {
  OnboardingContainerProps,
  OnboardingCardProps,
  WelcomeStepProps,
  CreateWorkspaceStepProps,
  InviteTeamStepProps,
  CreateProjectStepProps
} from './components/onboarding';

// Organisms - Workspace & Projects
export { WorkspaceSwitcher } from './components/workspace-switcher';
export type { WorkspaceSwitcherProps, Workspace } from './components/workspace-switcher';

export { 
  ProjectCardGrid,
  ProjectFiltersBar
} from './components/project-list';
export type { 
  ProjectCardGridProps,
  ProjectFiltersBarProps,
  Project,
  ProjectFilters
} from './components/project-list';

export { ProjectHero } from './components/project-detail';
export type { ProjectHeroProps } from './components/project-detail';

// Organisms - Kanban Board
export { KanbanBoard } from './components/kanban-board';
export { KanbanColumn } from './components/kanban-column';
export { KanbanCard, KanbanCardPlaceholder } from './components/kanban-card';
export { BoardHeader } from './components/board-header';
export type { 
  KanbanTask, 
  KanbanColumnType 
} from './components/kanban-board';
export type { BoardView, BoardFilter } from './components/board-header';

// Utilities
export { cn } from './lib/utils';
