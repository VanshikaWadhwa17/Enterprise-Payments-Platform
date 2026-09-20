import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@epp/auth';
import type { Currency, Money, PaymentStatus } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { PaymentGraphQL, FraudGraphQL } from '@epp/graphql';
import {
  EmptyState,
  ErrorState,
  Spinner,
  StatTile,
  Table,
  type TableColumn,
  type StatTileTrend,
} from '@epp/ui';

interface DashboardPayment {
  id: string;
  amount: Money;
  status: PaymentStatus;
  beneficiaryName: string;
  createdAt: string;
}

interface DashboardFraudCase {
  status: 'OPEN' | 'INVESTIGATING' | 'CLEARED' | 'CONFIRMED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TrendSublabel {
  text: string;
  trend?: StatTileTrend;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function summarizeAmounts(payments: DashboardPayment[]): string {
  const totalsByCurrency = new Map<Currency, number>();
  for (const payment of payments) {
    totalsByCurrency.set(
      payment.amount.currency,
      (totalsByCurrency.get(payment.amount.currency) ?? 0) + payment.amount.amount,
    );
  }
  return [...totalsByCurrency.entries()]
    .map(([currency, amount]) => formatMoney({ amount, currency }))
    .join(' + ');
}

function computeVolumeTrend(payments: DashboardPayment[]): TrendSublabel | null {
  const now = Date.now();
  const last7Days = payments.filter(
    (p) => now - new Date(p.createdAt).getTime() <= 7 * DAY_MS,
  ).length;
  const prev7Days = payments.filter((p) => {
    const age = now - new Date(p.createdAt).getTime();
    return age > 7 * DAY_MS && age <= 14 * DAY_MS;
  }).length;

  if (prev7Days === 0) {
    return null;
  }

  const pctChange = ((last7Days - prev7Days) / prev7Days) * 100;
  const rounded = Math.round(Math.abs(pctChange));
  if (rounded === 0) {
    return { text: 'flat vs last 7 days' };
  }
  return {
    text: `${rounded}% vs last 7 days`,
    trend: pctChange > 0 ? 'up' : 'down',
  };
}

const RECENT_PAYMENTS_COLUMNS: TableColumn<DashboardPayment>[] = [
  { key: 'id', label: 'Payment ID' },
  { key: 'beneficiaryName', label: 'Customer' },
  {
    key: 'amount',
    label: 'Amount',
    cellType: 'money',
    format: (value) => formatMoney(value as Money),
  },
  { key: 'status', label: 'Status', cellType: 'badge' },
  {
    key: 'createdAt',
    label: 'Date',
    format: (value) =>
      new Date(value as string).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
];

@Component({
  selector: 'epp-dashboard',
  imports: [Table, StatTile, Spinner, EmptyState, ErrorState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly getPaymentsGQL = inject(PaymentGraphQL.GetPaymentsGQL);
  private readonly getFraudCasesGQL = inject(FraudGraphQL.GetFraudCasesGQL);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly recentPaymentsColumns = RECENT_PAYMENTS_COLUMNS;

  protected readonly canViewPayments = computed(() =>
    this.authService.hasPermission('PAYMENT_VIEW'),
  );
  protected readonly canViewFraud = computed(() =>
    this.authService.hasPermission('FRAUD_VIEW'),
  );

  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const name = this.currentUser()?.fullName;
    return name ? `Good ${timeOfDay}, ${name}` : `Good ${timeOfDay}`;
  });

  protected readonly paymentsLoading = signal(false);
  protected readonly paymentsError = signal<string | null>(null);
  protected readonly payments = signal<DashboardPayment[]>([]);

  protected readonly fraudLoading = signal(false);
  protected readonly fraudError = signal<string | null>(null);
  protected readonly fraudCases = signal<DashboardFraudCase[]>([]);

  private readonly paymentsHaveData = computed(() => this.payments().length > 0);
  private readonly fraudHasData = computed(() => this.fraudCases().length > 0);

  protected readonly paymentVolumeDisplay = computed(() =>
    this.paymentsHaveData() ? summarizeAmounts(this.payments()) : '—',
  );
  protected readonly paymentVolumeTrend = computed(() =>
    this.paymentsHaveData() ? computeVolumeTrend(this.payments()) : null,
  );

  protected readonly pendingDisplay = computed(() =>
    this.paymentsHaveData()
      ? String(this.payments().filter((p) => p.status === 'PENDING_APPROVAL').length)
      : '—',
  );
  protected readonly inProgressSublabel = computed(() => {
    if (!this.paymentsHaveData()) {
      return undefined;
    }
    const count = this.payments().filter(
      (p) => p.status === 'VALIDATED' || p.status === 'PROCESSING',
    ).length;
    return `${count} in progress`;
  });

  protected readonly recentPayments = computed(() =>
    [...this.payments()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );

  protected readonly fraudAlertsDisplay = computed(() =>
    this.fraudHasData()
      ? String(
          this.fraudCases().filter(
            (c) => c.status === 'OPEN' || c.status === 'INVESTIGATING',
          ).length,
        )
      : '—',
  );
  protected readonly fraudSublabel = computed(() => {
    if (!this.fraudHasData()) {
      return undefined;
    }
    const count = this.fraudCases().filter(
      (c) => (c.status === 'OPEN' || c.status === 'INVESTIGATING') && c.riskLevel === 'HIGH',
    ).length;
    return `${count} high risk`;
  });

  constructor() {
    if (this.canViewPayments()) {
      this.loadPayments();
    }
    if (this.canViewFraud()) {
      this.loadFraud();
    }
  }

  loadPayments(): void {
    this.paymentsLoading.set(true);
    this.paymentsError.set(null);

    this.getPaymentsGQL.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: (result) => {
        if (!result.data) {
          this.paymentsError.set('Unable to load payment metrics right now.');
          this.paymentsLoading.set(false);
          return;
        }
        this.payments.set(
          result.data.payments.map((payment) => ({
            id: payment.id,
            amount: {
              amount: payment.amount.amount,
              currency: payment.amount.currency as string as Currency,
            },
            status: payment.status as string as PaymentStatus,
            beneficiaryName: payment.beneficiary.name,
            createdAt: payment.createdAt,
          })),
        );
        this.paymentsLoading.set(false);
      },
      error: () => {
        this.paymentsError.set('Unable to load payment metrics right now.');
        this.paymentsLoading.set(false);
      },
    });
  }

  loadFraud(): void {
    this.fraudLoading.set(true);
    this.fraudError.set(null);

    this.getFraudCasesGQL.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: (result) => {
        if (!result.data) {
          this.fraudError.set('Unable to load fraud metrics right now.');
          this.fraudLoading.set(false);
          return;
        }
        this.fraudCases.set(
          result.data.fraudCases.map((fraudCase) => ({
            status: fraudCase.status as DashboardFraudCase['status'],
            riskLevel: fraudCase.riskLevel as DashboardFraudCase['riskLevel'],
          })),
        );
        this.fraudLoading.set(false);
      },
      error: () => {
        this.fraudError.set('Unable to load fraud metrics right now.');
        this.fraudLoading.set(false);
      },
    });
  }

  openPayment(payment: DashboardPayment): void {
    this.router.navigate(['/payments', payment.id]);
  }
}
