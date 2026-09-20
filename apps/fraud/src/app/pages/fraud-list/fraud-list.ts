import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Currency, FraudCase } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { Button, EmptyState, ErrorState, Spinner, Table, type TableColumn } from '@epp/ui';
import { FraudService } from '../../services/fraud.service';

const COLUMNS: TableColumn<FraudCase>[] = [
  { key: 'paymentId', label: 'Payment' },
  {
    key: 'amount',
    label: 'Amount',
    cellType: 'money',
    format: (value, row) => formatMoney({ amount: value as number, currency: row.currency as Currency }),
  },
  { key: 'beneficiaryName', label: 'Beneficiary' },
  { key: 'score', label: 'Score', format: (value) => String(value) },
  { key: 'riskLevel', label: 'Risk', cellType: 'badge' },
  { key: 'status', label: 'Status', cellType: 'badge' },
];

@Component({
  selector: 'epp-fraud-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Spinner, EmptyState, ErrorState, Button],
  templateUrl: './fraud-list.html',
  styleUrl: './fraud-list.scss',
})
export class FraudList {
  private readonly fraudService = inject(FraudService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columns = COLUMNS;
  readonly fraudCases = signal<FraudCase[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.fraudService.getFraudCases().subscribe({
      next: (cases) => {
        this.fraudCases.set(cases);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load fraud cases right now.');
        this.loading.set(false);
      },
    });
  }

  openCase(fraudCase: FraudCase): void {
    this.router.navigate([fraudCase.id], { relativeTo: this.route });
  }
}
