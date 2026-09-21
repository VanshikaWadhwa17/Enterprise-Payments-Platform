import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type {
  Currency,
  FraudCase,
  FraudCaseStatus,
  Payment,
  PaymentStatus,
  ReconciliationRecord,
  ReconciliationStatus,
  RiskLevel,
} from '@epp/types';
import { FraudGraphQL, PaymentGraphQL, ReconciliationGraphQL } from '@epp/graphql';

function toPayment(fragment: PaymentGraphQL.PaymentFieldsFragment): Payment {
  return {
    id: fragment.id,
    amount: {
      amount: fragment.amount.amount,
      currency: fragment.amount.currency as string as Currency,
    },
    status: fragment.status as string as PaymentStatus,
    beneficiary: {
      name: fragment.beneficiary.name,
      accountNumber: fragment.beneficiary.accountNumber,
      country: fragment.beneficiary.country,
    },
    reference: fragment.reference ?? undefined,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

function toFraudCase(fragment: FraudGraphQL.FraudCaseFieldsFragment): FraudCase {
  return {
    id: fragment.id,
    paymentId: fragment.paymentId,
    amount: fragment.amount,
    currency: fragment.currency,
    beneficiaryName: fragment.beneficiaryName,
    score: fragment.score,
    riskLevel: fragment.riskLevel as string as RiskLevel,
    factors: fragment.factors,
    status: fragment.status as string as FraudCaseStatus,
    openedAt: fragment.openedAt,
  };
}

function toReconciliationRecord(
  fragment: ReconciliationGraphQL.ReconciliationRecordFieldsFragment,
): ReconciliationRecord {
  return {
    id: fragment.id,
    paymentId: fragment.paymentId,
    bankAmount: fragment.bankAmount,
    processorAmount: fragment.processorAmount,
    settlementAmount: fragment.settlementAmount,
    currency: fragment.currency,
    status: fragment.status as string as ReconciliationStatus,
    reconciledAt: fragment.reconciledAt,
  };
}

export interface CurrencyVolume {
  currency: Currency;
  count: number;
  totalAmount: number;
}

export interface PaymentStatusBreakdown {
  byStatus: Record<PaymentStatus, number>;
  successful: number;
  failed: number;
}

export interface FraudTrends {
  byStatus: Record<FraudCaseStatus, number>;
  byRiskLevel: Record<RiskLevel, number>;
}

export interface ReconciliationStatusBreakdown {
  byStatus: Record<ReconciliationStatus, number>;
}

const SUCCESSFUL_PAYMENT_STATUSES: ReadonlySet<PaymentStatus> = new Set(['COMPLETED', 'APPROVED']);
const FAILED_PAYMENT_STATUSES: ReadonlySet<PaymentStatus> = new Set([
  'FAILED',
  'REJECTED',
  'CANCELLED',
]);

function countBy<T extends string>(values: readonly T[], all: readonly T[]): Record<T, number> {
  const counts = Object.fromEntries(all.map((key) => [key, 0])) as Record<T, number>;
  for (const value of values) {
    counts[value] += 1;
  }
  return counts;
}

/**
 * Aggregation methods are pure functions over already-fetched data so they
 * can be unit tested independently of Apollo -- the fetch methods are thin
 * wrappers reused as-is from PaymentsService/FraudService/ReconciliationService's
 * pattern (GQL classes from @epp/graphql, not new backend queries).
 */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly getPaymentsGQL = inject(PaymentGraphQL.GetPaymentsGQL);
  private readonly getFraudCasesGQL = inject(FraudGraphQL.GetFraudCasesGQL);
  private readonly getReconciliationRecordsGQL = inject(
    ReconciliationGraphQL.GetReconciliationRecordsGQL,
  );

  getPayments(): Observable<Payment[]> {
    return this.getPaymentsGQL.fetch({ fetchPolicy: 'network-only' }).pipe(
      map((result) => {
        if (!result.data) {
          throw new Error('GetPayments returned no data');
        }
        return result.data.payments.map(toPayment);
      }),
    );
  }

  getFraudCases(): Observable<FraudCase[]> {
    return this.getFraudCasesGQL.fetch({ fetchPolicy: 'network-only' }).pipe(
      map((result) => {
        if (!result.data) {
          throw new Error('GetFraudCases returned no data');
        }
        return result.data.fraudCases.map(toFraudCase);
      }),
    );
  }

  getReconciliationRecords(): Observable<ReconciliationRecord[]> {
    return this.getReconciliationRecordsGQL
      .fetch({ variables: { status: undefined }, fetchPolicy: 'network-only' })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('GetReconciliationRecords returned no data');
          }
          return result.data.reconciliationRecords.map(toReconciliationRecord);
        }),
      );
  }

  /** Grouped by currency -- amounts in different currencies are never summed together. */
  getPaymentVolume(payments: readonly Payment[]): CurrencyVolume[] {
    const byCurrency = new Map<Currency, CurrencyVolume>();
    for (const payment of payments) {
      const currency = payment.amount.currency;
      const existing = byCurrency.get(currency) ?? { currency, count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += payment.amount.amount;
      byCurrency.set(currency, existing);
    }
    return Array.from(byCurrency.values());
  }

  getPaymentStatusBreakdown(payments: readonly Payment[]): PaymentStatusBreakdown {
    const allStatuses: PaymentStatus[] = [
      'CREATED',
      'VALIDATED',
      'PENDING_APPROVAL',
      'APPROVED',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'REJECTED',
      'CANCELLED',
    ];
    const byStatus = countBy(
      payments.map((payment) => payment.status),
      allStatuses,
    );
    let successful = 0;
    let failed = 0;
    for (const payment of payments) {
      if (SUCCESSFUL_PAYMENT_STATUSES.has(payment.status)) {
        successful += 1;
      } else if (FAILED_PAYMENT_STATUSES.has(payment.status)) {
        failed += 1;
      }
    }
    return { byStatus, successful, failed };
  }

  getFraudTrends(fraudCases: readonly FraudCase[]): FraudTrends {
    const allStatuses: FraudCaseStatus[] = ['OPEN', 'INVESTIGATING', 'CLEARED', 'CONFIRMED'];
    const allRiskLevels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
    return {
      byStatus: countBy(
        fraudCases.map((fraudCase) => fraudCase.status),
        allStatuses,
      ),
      byRiskLevel: countBy(
        fraudCases.map((fraudCase) => fraudCase.riskLevel),
        allRiskLevels,
      ),
    };
  }

  getReconciliationStatus(
    records: readonly ReconciliationRecord[],
  ): ReconciliationStatusBreakdown {
    const allStatuses: ReconciliationStatus[] = ['MATCHED', 'MISSING', 'MISMATCH', 'DUPLICATE'];
    return {
      byStatus: countBy(
        records.map((record) => record.status),
        allStatuses,
      ),
    };
  }
}
