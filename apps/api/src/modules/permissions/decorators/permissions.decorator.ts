import { SetMetadata } from '@nestjs/common';
import { ResourceType, ActionType } from '@nexora/types';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  resource: ResourceType;
  action: ActionType;
}

/**
 * Decorator para proteger rotas com verificação de permissões
 * @example
 * @RequirePermission({ resource: ResourceType.PROJECT, action: ActionType.EDIT })
 * async updateProject() { ... }
 */
export const RequirePermission = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator para verificar múltiplas permissões (qualquer uma)
 */
export const RequireAnyPermission = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, { any: permissions });

/**
 * Decorator para verificar múltiplas permissões (todas)
 */
export const RequireAllPermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, { all: permissions });
