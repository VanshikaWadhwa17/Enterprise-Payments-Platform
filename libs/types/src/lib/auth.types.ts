export type Role =
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'PAYMENT_ANALYST'
  | 'FRAUD_ANALYST'
  | 'VIEWER';

export type Permission =
  | 'PAYMENT_VIEW'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_APPROVE'
  | 'PAYMENT_CANCEL'
  | 'FRAUD_VIEW'
  | 'FRAUD_REVIEW'
  | 'FRAUD_BLOCK'
  | 'RECONCILIATION_VIEW'
  | 'RECONCILIATION_RESOLVE'
  | 'REPORT_VIEW'
  | 'USER_VIEW'
  | 'USER_MANAGE'
  | 'ROLE_MANAGE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}
