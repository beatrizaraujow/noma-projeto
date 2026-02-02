/**
 * Sistema de Permissões - Tipos e Interfaces
 */

// ==================== ACTIONS & RESOURCES ====================

export enum ResourceType {
  PROJECT = 'project',
  TASK = 'task',
  COMMENT = 'comment',
  MEMBER = 'member',
  WORKSPACE = 'workspace',
  FILE = 'file',
  SETTINGS = 'settings',
}

export enum ActionType {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  MANAGE = 'manage', // Full control including permissions
  COMMENT = 'comment',
  ASSIGN = 'assign',
  ARCHIVE = 'archive',
}

export enum PermissionScope {
  ALL = 'all', // All resources
  OWN = 'own', // Only owned resources
  ASSIGNED = 'assigned', // Only assigned resources
  TEAM = 'team', // Team resources
}

// ==================== ROLES ====================

export enum SystemRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
  GUEST = 'GUEST',
  CUSTOM = 'CUSTOM',
}

export interface Permission {
  id: string;
  roleId: string;
  resource: ResourceType;
  action: ActionType;
  scope: PermissionScope;
  conditions?: Record<string, any>;
  createdAt: Date;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  isSystem: boolean;
  createdById: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PROJECT PERMISSIONS ====================

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleId?: string;
  role: SystemRole;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  customRole?: CustomRole;
}

// ==================== GUEST ACCESS ====================

export interface GuestAccess {
  id: string;
  projectId: string;
  userId?: string;
  email: string;
  token: string;
  canView: boolean;
  canComment: boolean;
  expiresAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  accessedAt?: Date;
}

export interface CreateGuestAccessDto {
  projectId: string;
  email: string;
  canView?: boolean;
  canComment?: boolean;
  expiresAt?: Date;
}

// ==================== AUDIT LOGS ====================

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',

  // CRUD Operations
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',

  // Permissions
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REMOVE = 'role_remove',

  // Members
  MEMBER_ADD = 'member_add',
  MEMBER_REMOVE = 'member_remove',
  INVITE_SEND = 'invite_send',
  INVITE_ACCEPT = 'invite_accept',

  // Guest Access
  GUEST_ACCESS_CREATE = 'guest_access_create',
  GUEST_ACCESS_REVOKE = 'guest_access_revoke',
  GUEST_ACCESS_USE = 'guest_access_use',

  // Tasks
  TASK_ASSIGN = 'task_assign',
  TASK_COMPLETE = 'task_complete',
  TASK_REOPEN = 'task_reopen',
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction | string;
  resource: ResourceType | string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAuditLogDto {
  userId: string;
  action: AuditAction | string;
  resource: ResourceType | string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ==================== DTOs ====================

export interface CreateCustomRoleDto {
  name: string;
  description?: string;
  workspaceId?: string;
  permissions: {
    resource: ResourceType;
    action: ActionType;
    scope?: PermissionScope;
    conditions?: Record<string, any>;
  }[];
}

export interface UpdateCustomRoleDto {
  name?: string;
  description?: string;
  permissions?: {
    resource: ResourceType;
    action: ActionType;
    scope?: PermissionScope;
    conditions?: Record<string, any>;
  }[];
}

export interface CreateProjectMemberDto {
  projectId: string;
  userId: string;
  role?: SystemRole;
  roleId?: string;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canManage?: boolean;
}

export interface UpdateProjectMemberDto {
  role?: SystemRole;
  roleId?: string;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canManage?: boolean;
}

// ==================== PERMISSION CHECKS ====================

export interface PermissionCheck {
  userId: string;
  resource: ResourceType;
  action: ActionType;
  resourceId?: string;
  scope?: PermissionScope;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  role?: string;
  permissions?: string[];
}

// ==================== PREDEFINED ROLES ====================

export const DEFAULT_ROLES = {
  OWNER: {
    name: 'Owner',
    description: 'Full access to everything',
    permissions: [
      { resource: ResourceType.PROJECT, action: ActionType.MANAGE },
      { resource: ResourceType.TASK, action: ActionType.MANAGE },
      { resource: ResourceType.COMMENT, action: ActionType.MANAGE },
      { resource: ResourceType.MEMBER, action: ActionType.MANAGE },
      { resource: ResourceType.SETTINGS, action: ActionType.MANAGE },
    ],
  },
  ADMIN: {
    name: 'Admin',
    description: 'Can manage most things except ownership',
    permissions: [
      { resource: ResourceType.PROJECT, action: ActionType.EDIT },
      { resource: ResourceType.TASK, action: ActionType.MANAGE },
      { resource: ResourceType.COMMENT, action: ActionType.MANAGE },
      { resource: ResourceType.MEMBER, action: ActionType.EDIT },
    ],
  },
  MEMBER: {
    name: 'Member',
    description: 'Can create and edit assigned content',
    permissions: [
      { resource: ResourceType.PROJECT, action: ActionType.VIEW },
      { resource: ResourceType.TASK, action: ActionType.CREATE },
      { resource: ResourceType.TASK, action: ActionType.EDIT, scope: PermissionScope.ASSIGNED },
      { resource: ResourceType.COMMENT, action: ActionType.CREATE },
      { resource: ResourceType.COMMENT, action: ActionType.EDIT, scope: PermissionScope.OWN },
    ],
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      { resource: ResourceType.PROJECT, action: ActionType.VIEW },
      { resource: ResourceType.TASK, action: ActionType.VIEW },
      { resource: ResourceType.COMMENT, action: ActionType.VIEW },
    ],
  },
  GUEST: {
    name: 'Guest',
    description: 'Limited temporary access',
    permissions: [
      { resource: ResourceType.PROJECT, action: ActionType.VIEW },
      { resource: ResourceType.TASK, action: ActionType.VIEW },
    ],
  },
} as const;
