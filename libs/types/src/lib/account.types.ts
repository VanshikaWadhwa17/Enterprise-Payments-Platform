export type AccountStatus = 'ACTIVE' | 'DORMANT' | 'CLOSED' | 'FROZEN';

export interface Account {
  id: string;
  accountNumber: string;
  ownerName: string;
  status: AccountStatus;
  balance: number;
  currency: string;
}
