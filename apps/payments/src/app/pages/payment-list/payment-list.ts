import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Payment } from '@epp/types';
import { formatMoney } from '@epp/utils';
import {
  Button,
  EmptyState,
  ErrorState,
  Spinner,
  Table,
  type TableColumn,
} from '@epp/ui';
import { PaymentsService } from '../../services/payments.service';

const COLUMNS: TableColumn<Payment>[] = [
  { key: 'id', label: 'ID' },
  {
    key: 'amount',
    label: 'Amount',
    cellType: 'money',
    format: (value) => formatMoney(value as Payment['amount']),
  },
  {
    key: 'beneficiary',
    label: 'Beneficiary',
    format: (value) => (value as Payment['beneficiary']).name,
  },
  { key: 'status', label: 'Status', cellType: 'badge' },
];

@Component({
  selector: 'epp-payment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Spinner, EmptyState, ErrorState, Button],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.scss',
})
export class PaymentList {
  private readonly paymentsService = inject(PaymentsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columns = COLUMNS;
  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentsService.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load payments right now.');
        this.loading.set(false);
      },
    });
  }

  openPayment(payment: Payment): void {
    this.router.navigate([payment.id], { relativeTo: this.route });
  }

  createPayment(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
}
