import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ReconciliationRecord, ReconciliationStatus } from '@epp/types';
import { ReconciliationGraphQL } from '@epp/graphql';

function toRecord(
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

@Injectable({ providedIn: 'root' })
export class ReconciliationService {
  private readonly getRecordsGQL = inject(ReconciliationGraphQL.GetReconciliationRecordsGQL);

  getRecords(status: ReconciliationStatus | undefined): Observable<ReconciliationRecord[]> {
    return this.getRecordsGQL
      .fetch({
        variables: { status: status as string as ReconciliationGraphQL.ReconciliationStatus | undefined },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('GetReconciliationRecords returned no data');
          }
          return result.data.reconciliationRecords.map(toRecord);
        }),
      );
  }
}
