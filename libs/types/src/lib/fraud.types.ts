export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FraudScore {
  score: number;
  riskLevel: RiskLevel;
  factors: string[];
}

export type FraudCaseStatus =
  'OPEN' | 'INVESTIGATING' | 'CLEARED' | 'CONFIRMED';

export interface FraudCase {
  id: string;
  paymentId: string;
  status: FraudCaseStatus;
  score: FraudScore;
  openedAt: string;
}
