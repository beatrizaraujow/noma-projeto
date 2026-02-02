import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../roles.service';
import { PERMISSIONS_KEY, PermissionRequirement } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<PermissionRequirement[] | { any: PermissionRequirement[] } | { all: PermissionRequirement[] }>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!permissions) {
      return true; // No permission requirements
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Super admin sempre tem permissão
    if (user.role === 'ADMIN') {
      return true;
    }

    // Obter projectId dos params ou body
    const projectId = request.params.projectId || request.body.projectId;

    // Array de permissões simples
    if (Array.isArray(permissions)) {
      for (const perm of permissions) {
        const hasPermission = await this.rolesService.checkPermission(
          user.id,
          perm.resource,
          perm.action,
          undefined,
          projectId
        );

        if (!hasPermission) {
          throw new ForbiddenException(
            `Você não tem permissão para ${perm.action} em ${perm.resource}`
          );
        }
      }
      return true;
    }

    // Verificar qualquer permissão (OR)
    if ('any' in permissions) {
      for (const perm of permissions.any) {
        const hasPermission = await this.rolesService.checkPermission(
          user.id,
          perm.resource,
          perm.action,
          undefined,
          projectId
        );

        if (hasPermission) {
          return true;
        }
      }
      throw new ForbiddenException('Você não tem nenhuma das permissões necessárias');
    }

    // Verificar todas as permissões (AND)
    if ('all' in permissions) {
      for (const perm of permissions.all) {
        const hasPermission = await this.rolesService.checkPermission(
          user.id,
          perm.resource,
          perm.action,
          undefined,
          projectId
        );

        if (!hasPermission) {
          throw new ForbiddenException(
            `Você não tem permissão para ${perm.action} em ${perm.resource}`
          );
        }
      }
      return true;
    }

    return false;
  }
}
