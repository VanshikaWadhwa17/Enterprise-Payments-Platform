import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '@epp/auth';
import type { FraudCase, Payment, ReconciliationRecord } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { Card, EmptyState, ErrorState, Spinner, StatTile, Table, type TableColumn } from '@epp/ui';
import { ReportsService } from './services/reports.service';

interface BreakdownRow {
  label: string;
  count: number;
}

const BREAKDOWN_COLUMNS: TableColumn<BreakdownRow>[] = [
  { key: 'label', label: 'Status' },
  { key: 'count', label: 'Count' },
];

function toRows(counts: Record<string, number>): BreakdownRow[] {
  return Object.entries(counts).map(([label, count]) => ({ label, count }));
}

@Component({
  selector: 'epp-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, StatTile, Table, Spinner, EmptyState, ErrorState],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly reportsService = inject(ReportsService);
  private readonly authService = inject(AuthService);

  protected readonly breakdownColumns = BREAKDOWN_COLUMNS;

  protected readonly canViewPayments = computed(() =>
    this.authService.hasPermission('PAYMENT_VIEW'),
  );
  protected readonly canViewFraud = computed(() => this.authService.hasPermission('FRAUD_VIEW'));
  protected readonly canViewReconciliation = computed(() =>
    this.authService.hasPermission('RECONCILIATION_VIEW'),
  );

  protected readonly paymentsLoading = signal(false);
  protected readonly paymentsError = signal<string | null>(null);
  protected readonly payments = signal<Payment[]>([]);

  protected readonly fraudLoading = signal(false);
  protected readonly fraudError = signal<string | null>(null);
  protected readonly fraudCases = signal<FraudCase[]>([]);

  protected readonly reconciliationLoading = signal(false);
  protected readonly reconciliationError = signal<string | null>(null);
  protected readonly reconciliationRecords = signal<ReconciliationRecord[]>([]);

  protected readonly paymentVolume = computed(() =>
    this.reportsService.getPaymentVolume(this.payments()),
  );
  protected readonly paymentVolumeDisplay = computed(() =>
    this.paymentVolume()
      .map((v) => formatMoney({ amount: v.totalAmount, currency: v.currency }))
      .join(' + ') || '—',
  );
  protected readonly paymentStatusBreakdown = computed(() =>
    this.reportsService.getPaymentStatusBreakdown(this.payments()),
  );
  protected readonly paymentStatusRows = computed(() =>
    toRows(this.paymentStatusBreakdown().byStatus),
  );

  protected readonly fraudTrends = computed(() => this.reportsService.getFraudTrends(this.fraudCases()));
  protected readonly fraudStatusRows = computed(() => toRows(this.fraudTrends().byStatus));
  protected readonly fraudRiskRows = computed(() => toRows(this.fraudTrends().byRiskLevel));

  protected readonly reconciliationStatus = computed(() =>
    this.reportsService.getReconciliationStatus(this.reconciliationRecords()),
  );
  protected readonly reconciliationRows = computed(() =>
    toRows(this.reconciliationStatus().byStatus),
  );

  constructor() {
    if (this.canViewPayments()) {
      this.loadPayments();
    }
    if (this.canViewFraud()) {
      this.loadFraud();
    }
    if (this.canViewReconciliation()) {
      this.loadReconciliation();
    }
  }

  loadPayments(): void {
    this.paymentsLoading.set(true);
    this.paymentsError.set(null);
    this.reportsService.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.paymentsLoading.set(false);
      },
      error: () => {
        this.paymentsError.set('Unable to load payment reports right now.');
        this.paymentsLoading.set(false);
      },
    });
  }

  loadFraud(): void {
    this.fraudLoading.set(true);
    this.fraudError.set(null);
    this.reportsService.getFraudCases().subscribe({
      next: (fraudCases) => {
        this.fraudCases.set(fraudCases);
        this.fraudLoading.set(false);
      },
      error: () => {
        this.fraudError.set('Unable to load fraud reports right now.');
        this.fraudLoading.set(false);
      },
    });
  }

  loadReconciliation(): void {
    this.reconciliationLoading.set(true);
    this.reconciliationError.set(null);
    this.reportsService.getReconciliationRecords().subscribe({
      next: (records) => {
        this.reconciliationRecords.set(records);
        this.reconciliationLoading.set(false);
      },
      error: () => {
        this.reconciliationError.set('Unable to load reconciliation reports right now.');
        this.reconciliationLoading.set(false);
      },
    });
  }
}
