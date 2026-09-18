export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FraudCaseStatus = 'OPEN' | 'INVESTIGATING' | 'CLEARED' | 'CONFIRMED';

export interface FraudCase {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  beneficiaryName: string;
  score: number;
  riskLevel: RiskLevel;
  factors: string[];
  status: FraudCaseStatus;
  openedAt: string;
}
