export type Role = 'ADMIN' | 'MAKER' | 'CHECKER' | 'OPERATIONS';

export type Permission =
  | 'VIEW_PAYMENTS'
  | 'CREATE_PAYMENT'
  | 'APPROVE_PAYMENT'
  | 'REJECT_PAYMENT'
  | 'INVESTIGATE_PAYMENTS'
  | 'RECONCILE_PAYMENTS'
  | 'VIEW_REPORTS'
  | 'MANAGE_USERS'
  | 'MANAGE_CONFIGURATION';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
}
