import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Currency, ReconciliationRecord, ReconciliationStatus } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { Button, EmptyState, ErrorState, Modal, Spinner, StatusBadge, Table, type TableColumn } from '@epp/ui';
import { ReconciliationService } from '../../services/reconciliation.service';

const STATUS_FILTERS: Array<{ label: string; value: ReconciliationStatus | undefined }> = [
  { label: 'All', value: undefined },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'Missing', value: 'MISSING' },
  { label: 'Mismatch', value: 'MISMATCH' },
  { label: 'Duplicate', value: 'DUPLICATE' },
];

const COLUMNS: TableColumn<ReconciliationRecord>[] = [
  { key: 'paymentId', label: 'Payment' },
  {
    key: 'bankAmount',
    label: 'Bank',
    cellType: 'money',
    format: (value, row) => formatMoney({ amount: value as number, currency: row.currency as Currency }),
  },
  {
    key: 'processorAmount',
    label: 'Processor',
    cellType: 'money',
    format: (value, row) => formatMoney({ amount: value as number, currency: row.currency as Currency }),
  },
  {
    key: 'settlementAmount',
    label: 'Settlement',
    cellType: 'money',
    format: (value, row) => formatMoney({ amount: value as number, currency: row.currency as Currency }),
  },
  { key: 'status', label: 'Result', cellType: 'badge' },
];

@Component({
  selector: 'epp-reconciliation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Spinner, EmptyState, ErrorState, Modal, StatusBadge, DatePipe, Button],
  templateUrl: './reconciliation-list.html',
  styleUrl: './reconciliation-list.scss',
})
export class ReconciliationList {
  private readonly reconciliationService = inject(ReconciliationService);

  readonly columns = COLUMNS;
  readonly statusFilters = STATUS_FILTERS;
  readonly selectedStatus = signal<ReconciliationStatus | undefined>(undefined);

  readonly records = signal<ReconciliationRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly investigating = signal<ReconciliationRecord | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reconciliationService.getRecords(this.selectedStatus()).subscribe({
      next: (records) => {
        this.records.set(records);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load reconciliation records right now.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(value: string): void {
    this.selectedStatus.set((value || undefined) as ReconciliationStatus | undefined);
    this.load();
  }

  investigate(record: ReconciliationRecord): void {
    this.investigating.set(record);
  }

  closeInvestigation(): void {
    this.investigating.set(null);
  }
}
