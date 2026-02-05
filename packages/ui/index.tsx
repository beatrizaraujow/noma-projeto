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

// Organisms - Task Detail & Comments
export {
  TaskDetailHeader,
  TaskMetadataSidebar,
  TaskActivityTimeline,
} from './components/task-detail';
export type {
  TaskMetadata,
  TaskActivity,
} from './components/task-detail';

export {
  TaskComments,
  TaskComment,
  TaskCommentInput,
} from './components/task-comments';
export type {
  Comment,
  User,
} from './components/task-comments';

export {
  TaskAttachments,
  TaskAttachmentItem,
  TaskAttachmentUpload,
} from './components/task-attachments';
export type {
  Attachment,
} from './components/task-attachments';

export { RichTextEditor } from './components/rich-text-editor';
export { TaskDetailPanel } from './components/task-detail-panel';
export type { Task } from './components/task-detail-panel';

// View Components
export { ViewSwitcher } from './components/view-switcher';
export type { ViewSwitcherProps, ViewType } from './components/view-switcher';

export { TaskListView } from './components/task-list-view';
export type { TaskListViewProps, TaskListItem, SortField, SortDirection } from './components/task-list-view';

export { TaskCalendarView } from './components/task-calendar-view';
export type { TaskCalendarViewProps, CalendarTask } from './components/task-calendar-view';

export { TaskTimelineView } from './components/task-timeline-view';
export type { TaskTimelineViewProps, TimelineTask } from './components/task-timeline-view';

// Real-time Collaboration Components
export { PresenceAvatars } from './components/presence-avatars';
export type { PresenceAvatarsProps, PresenceUser } from './components/presence-avatars';

export { CursorTracker } from './components/cursor-tracker';
export type { CursorTrackerProps, RemoteCursor } from './components/cursor-tracker';

export { ToastContainer, ToastItem, useToast } from './components/toast';
export type { ToastContainerProps, ToastProps, Toast, ToastType } from './components/toast';

export { TypingIndicator } from './components/typing-indicator';
export type { TypingIndicatorProps, TypingUser } from './components/typing-indicator';

export { PulseOverlay, usePulse } from './components/pulse-overlay';
export type { PulseOverlayProps } from './components/pulse-overlay';

// Utilities
export { cn } from './lib/utils';
