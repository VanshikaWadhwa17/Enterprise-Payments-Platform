import type { Permission, Role } from '@epp/types';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'PAYMENT_VIEW',
    'PAYMENT_CREATE',
    'PAYMENT_APPROVE',
    'PAYMENT_CANCEL',
    'FRAUD_VIEW',
    'FRAUD_REVIEW',
    'FRAUD_BLOCK',
    'RECONCILIATION_VIEW',
    'RECONCILIATION_RESOLVE',
    'REPORT_VIEW',
    'USER_VIEW',
    'USER_MANAGE',
    'ROLE_MANAGE',
  ],
  PAYMENT_ANALYST: [
    'PAYMENT_VIEW',
    'PAYMENT_CREATE',
    'RECONCILIATION_VIEW',
    'REPORT_VIEW',
  ],
  OPERATIONS_MANAGER: [
    'PAYMENT_VIEW',
    'PAYMENT_APPROVE',
    'PAYMENT_CANCEL',
    'RECONCILIATION_VIEW',
    'RECONCILIATION_RESOLVE',
    'REPORT_VIEW',
  ],
  FRAUD_ANALYST: [
    'FRAUD_VIEW',
    'FRAUD_REVIEW',
    'FRAUD_BLOCK',
    'PAYMENT_VIEW',
    'REPORT_VIEW',
  ],
  VIEWER: [
    'PAYMENT_VIEW',
    'FRAUD_VIEW',
    'RECONCILIATION_VIEW',
    'REPORT_VIEW',
  ],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
