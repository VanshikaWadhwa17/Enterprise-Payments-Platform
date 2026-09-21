import { TestBed } from '@angular/core/testing';
import type { FraudCase, Payment, ReconciliationRecord } from '@epp/types';
import { FraudGraphQL, PaymentGraphQL, ReconciliationGraphQL } from '@epp/graphql';
import { ReportsService } from './reports.service';

function payment(amount: number, currency: Payment['amount']['currency'], status: Payment['status']): Payment {
  return {
    id: crypto.randomUUID(),
    amount: { amount, currency },
    status,
    beneficiary: { name: 'Test', accountNumber: '123', country: 'US' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function fraudCase(status: FraudCase['status'], riskLevel: FraudCase['riskLevel']): FraudCase {
  return {
    id: crypto.randomUUID(),
    paymentId: crypto.randomUUID(),
    amount: 100,
    currency: 'USD',
    beneficiaryName: 'Test',
    score: 50,
    riskLevel,
    factors: [],
    status,
    openedAt: new Date().toISOString(),
  };
}

function reconciliationRecord(status: ReconciliationRecord['status']): ReconciliationRecord {
  return {
    id: crypto.randomUUID(),
    paymentId: crypto.randomUUID(),
    bankAmount: 100,
    processorAmount: 100,
    settlementAmount: 100,
    currency: 'USD',
    status,
    reconciledAt: new Date().toISOString(),
  };
}

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PaymentGraphQL.GetPaymentsGQL, useValue: {} },
        { provide: FraudGraphQL.GetFraudCasesGQL, useValue: {} },
        { provide: ReconciliationGraphQL.GetReconciliationRecordsGQL, useValue: {} },
      ],
    });
    service = TestBed.inject(ReportsService);
  });

  describe('getPaymentVolume', () => {
    it('keeps currencies separate instead of summing across them', () => {
      const volume = service.getPaymentVolume([
        payment(500, 'EUR', 'COMPLETED'),
        payment(200, 'USD', 'COMPLETED'),
        payment(300, 'EUR', 'CREATED'),
      ]);

      const eur = volume.find((v) => v.currency === 'EUR');
      const usd = volume.find((v) => v.currency === 'USD');
      expect(eur).toEqual({ currency: 'EUR', count: 2, totalAmount: 800 });
      expect(usd).toEqual({ currency: 'USD', count: 1, totalAmount: 200 });
      expect(volume).toHaveLength(2);
    });

    it('returns an empty array for no payments', () => {
      expect(service.getPaymentVolume([])).toEqual([]);
    });
  });

  describe('getPaymentStatusBreakdown', () => {
    it('counts every status and derives successful vs failed', () => {
      const breakdown = service.getPaymentStatusBreakdown([
        payment(100, 'USD', 'COMPLETED'),
        payment(100, 'USD', 'APPROVED'),
        payment(100, 'USD', 'FAILED'),
        payment(100, 'USD', 'REJECTED'),
        payment(100, 'USD', 'CANCELLED'),
        payment(100, 'USD', 'CREATED'),
      ]);

      expect(breakdown.byStatus.COMPLETED).toBe(1);
      expect(breakdown.byStatus.APPROVED).toBe(1);
      expect(breakdown.byStatus.CREATED).toBe(1);
      expect(breakdown.byStatus.VALIDATED).toBe(0);
      expect(breakdown.successful).toBe(2);
      expect(breakdown.failed).toBe(3);
    });
  });

  describe('getFraudTrends', () => {
    it('groups by status and risk level independently', () => {
      const trends = service.getFraudTrends([
        fraudCase('OPEN', 'HIGH'),
        fraudCase('OPEN', 'LOW'),
        fraudCase('CONFIRMED', 'HIGH'),
      ]);

      expect(trends.byStatus.OPEN).toBe(2);
      expect(trends.byStatus.CONFIRMED).toBe(1);
      expect(trends.byStatus.CLEARED).toBe(0);
      expect(trends.byRiskLevel.HIGH).toBe(2);
      expect(trends.byRiskLevel.LOW).toBe(1);
      expect(trends.byRiskLevel.MEDIUM).toBe(0);
    });
  });

  describe('getReconciliationStatus', () => {
    it('counts every status including zero-count ones', () => {
      const breakdown = service.getReconciliationStatus([
        reconciliationRecord('MATCHED'),
        reconciliationRecord('MATCHED'),
        reconciliationRecord('MISMATCH'),
      ]);

      expect(breakdown.byStatus.MATCHED).toBe(2);
      expect(breakdown.byStatus.MISMATCH).toBe(1);
      expect(breakdown.byStatus.MISSING).toBe(0);
      expect(breakdown.byStatus.DUPLICATE).toBe(0);
    });
  });
});
