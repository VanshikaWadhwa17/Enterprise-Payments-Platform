import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { FraudCase, FraudCaseStatus, RiskLevel } from '@epp/types';
import { FraudGraphQL } from '@epp/graphql';

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

@Injectable({ providedIn: 'root' })
export class FraudService {
  private readonly getFraudCasesGQL = inject(FraudGraphQL.GetFraudCasesGQL);
  private readonly getFraudCaseGQL = inject(FraudGraphQL.GetFraudCaseGQL);
  private readonly investigateFraudCaseGQL = inject(FraudGraphQL.InvestigateFraudCaseGQL);
  private readonly approveFraudCaseGQL = inject(FraudGraphQL.ApproveFraudCaseGQL);
  private readonly blockFraudCaseGQL = inject(FraudGraphQL.BlockFraudCaseGQL);

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

  getFraudCase(id: string): Observable<FraudCase | undefined> {
    return this.getFraudCaseGQL.fetch({ variables: { id }, fetchPolicy: 'network-only' }).pipe(
      map((result) => (result.data?.fraudCase ? toFraudCase(result.data.fraudCase) : undefined)),
    );
  }

  investigate(id: string): Observable<FraudCase> {
    return this.investigateFraudCaseGQL.mutate({ variables: { id } }).pipe(
      map((result) => {
        if (!result.data) {
          throw new Error('investigateFraudCase returned no data');
        }
        return toFraudCase(result.data.investigateFraudCase);
      }),
    );
  }

  approve(id: string): Observable<FraudCase> {
    return this.approveFraudCaseGQL.mutate({ variables: { id } }).pipe(
      map((result) => {
        if (!result.data) {
          throw new Error('approveFraudCase returned no data');
        }
        return toFraudCase(result.data.approveFraudCase);
      }),
    );
  }

  block(id: string): Observable<FraudCase> {
    return this.blockFraudCaseGQL.mutate({ variables: { id } }).pipe(
      map((result) => {
        if (!result.data) {
          throw new Error('blockFraudCase returned no data');
        }
        return toFraudCase(result.data.blockFraudCase);
      }),
    );
  }
}
