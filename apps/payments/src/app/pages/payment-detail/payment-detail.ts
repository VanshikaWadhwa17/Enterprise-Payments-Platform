import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { AuthService } from '@epp/auth';
import type { PaymentStatus } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { Button, Card, StatusBadge } from '@epp/ui';
import { PaymentsService } from '../../services/payments.service';

const TERMINAL_STATUSES: PaymentStatus[] = [
  'COMPLETED',
  'FAILED',
  'REJECTED',
  'CANCELLED',
];

@Component({
  selector: 'epp-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, StatusBadge, Button, DatePipe],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.scss',
})
export class PaymentDetail {
  private readonly paymentsService = inject(PaymentsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly id = input.required<string>();
  readonly loading = signal(true);

  private readonly id$ = toObservable(this.id);

  private readonly fetchedPayment = toSignal(
    this.id$.pipe(
      tap(() => this.loading.set(true)),
      switchMap((id) => this.paymentsService.getPayment(id)),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: undefined },
  );

  private readonly statusOverride = signal<{ id: string; status: PaymentStatus } | null>(null);

  readonly payment = computed(() => {
    const payment = this.fetchedPayment();
    const override = this.statusOverride();
    if (payment && override && override.id === payment.id) {
      return { ...payment, status: override.status };
    }
    return payment;
  });

  readonly canApprove = computed(
    () =>
      !TERMINAL_STATUSES.includes(this.payment()?.status as PaymentStatus) &&
      this.authService.hasPermission('PAYMENT_APPROVE'),
  );

  readonly canCancel = computed(
    () =>
      !TERMINAL_STATUSES.includes(this.payment()?.status as PaymentStatus) &&
      this.authService.hasPermission('PAYMENT_CANCEL'),
  );

  readonly updating = signal(false);

  readonly formatMoney = formatMoney;

  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  approve(): void {
    this.setStatus('APPROVED');
  }

  cancel(): void {
    this.setStatus('CANCELLED');
  }

  private setStatus(status: PaymentStatus): void {
    const payment = this.payment();
    if (!payment || this.updating()) {
      return;
    }
    this.updating.set(true);
    this.paymentsService.updateStatus(payment.id, status).subscribe({
      next: (updated) => {
        this.statusOverride.set({ id: updated.id, status: updated.status });
        this.updating.set(false);
      },
      error: () => this.updating.set(false),
    });
  }
}
