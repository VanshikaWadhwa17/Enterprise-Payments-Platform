import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';
import type { CreatePayment, Payment } from '@epp/types';

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'P1001',
    amount: { amount: 500, currency: 'EUR' },
    status: 'COMPLETED',
    beneficiary: {
      id: 'B1',
      name: 'John Smith',
      accountNumber: 'IE29AIBK93115212345678',
      country: 'IE',
    },
    createdAt: '2026-09-10T09:12:00.000Z',
    updatedAt: '2026-09-10T09:14:00.000Z',
  },
  {
    id: 'P1002',
    amount: { amount: 250, currency: 'EUR' },
    status: 'PROCESSING',
    beneficiary: {
      id: 'B2',
      name: 'Amazon',
      accountNumber: 'DE89370400440532013000',
      country: 'DE',
    },
    createdAt: '2026-09-15T14:03:00.000Z',
    updatedAt: '2026-09-15T14:03:00.000Z',
  },
  {
    id: 'P1003',
    amount: { amount: 800, currency: 'EUR' },
    status: 'FAILED',
    beneficiary: {
      id: 'B3',
      name: 'Sarah Connor',
      accountNumber: 'FR1420041010050500013M02606',
      country: 'FR',
    },
    createdAt: '2026-09-16T11:47:00.000Z',
    updatedAt: '2026-09-16T11:48:00.000Z',
  },
];

const SIMULATED_LATENCY_MS = 300;

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly payments$ = new BehaviorSubject<Payment[]>(INITIAL_PAYMENTS);
  private nextSequence = INITIAL_PAYMENTS.length + 1;

  getPayments(): Observable<Payment[]> {
    return this.payments$.pipe(delay(SIMULATED_LATENCY_MS));
  }

  getPayment(id: string): Observable<Payment | undefined> {
    return this.payments$.pipe(
      map((payments) => payments.find((payment) => payment.id === id)),
      delay(SIMULATED_LATENCY_MS),
    );
  }

  createPayment(payload: CreatePayment): Observable<Payment> {
    const now = new Date().toISOString();
    const sequence = this.nextSequence++;
    const payment: Payment = {
      ...payload,
      beneficiary: { ...payload.beneficiary, id: `B${sequence}` },
      id: `P${1000 + sequence}`,
      status: 'CREATED',
      createdAt: now,
      updatedAt: now,
    };

    this.payments$.next([payment, ...this.payments$.value]);

    return of(payment).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
