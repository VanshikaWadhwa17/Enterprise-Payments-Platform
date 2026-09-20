import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { CreatePayment, Currency, Payment, PaymentStatus } from '@epp/types';
import { PaymentGraphQL } from '@epp/graphql';

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

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly getPaymentsGQL = inject(PaymentGraphQL.GetPaymentsGQL);
  private readonly getPaymentGQL = inject(PaymentGraphQL.GetPaymentGQL);
  private readonly createPaymentGQL = inject(PaymentGraphQL.CreatePaymentGQL);
  private readonly updatePaymentStatusGQL = inject(
    PaymentGraphQL.UpdatePaymentStatusGQL,
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

  getPayment(id: string): Observable<Payment | undefined> {
    return this.getPaymentGQL.fetch({ variables: { id }, fetchPolicy: 'network-only' }).pipe(
      map((result) => (result.data?.payment ? toPayment(result.data.payment) : undefined)),
    );
  }

  createPayment(payload: CreatePayment): Observable<Payment> {
    return this.createPaymentGQL
      .mutate({
        variables: {
          input: {
            amount: payload.amount.amount,
            currency: payload.amount.currency as string as PaymentGraphQL.Currency,
            beneficiaryName: payload.beneficiary.name,
            beneficiaryAccountNumber: payload.beneficiary.accountNumber,
            beneficiaryCountry: payload.beneficiary.country,
          },
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('createPayment returned no data');
          }
          return toPayment(result.data.createPayment);
        }),
      );
  }

  updateStatus(id: string, status: PaymentStatus): Observable<Payment> {
    return this.updatePaymentStatusGQL
      .mutate({
        variables: { id, status: status as string as PaymentGraphQL.PaymentStatus },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('updatePaymentStatus returned no data');
          }
          return toPayment(result.data.updatePaymentStatus);
        }),
      );
  }
}
