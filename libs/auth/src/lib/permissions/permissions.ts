import type { Permission, Role } from '@epp/types';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'VIEW_PAYMENTS',
    'CREATE_PAYMENT',
    'APPROVE_PAYMENT',
    'REJECT_PAYMENT',
    'INVESTIGATE_PAYMENTS',
    'RECONCILE_PAYMENTS',
    'VIEW_REPORTS',
    'MANAGE_USERS',
    'MANAGE_CONFIGURATION',
  ],
  MAKER: ['VIEW_PAYMENTS', 'CREATE_PAYMENT'],
  CHECKER: ['VIEW_PAYMENTS', 'APPROVE_PAYMENT', 'REJECT_PAYMENT'],
  OPERATIONS: [
    'VIEW_PAYMENTS',
    'INVESTIGATE_PAYMENTS',
    'RECONCILE_PAYMENTS',
    'VIEW_REPORTS',
  ],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
