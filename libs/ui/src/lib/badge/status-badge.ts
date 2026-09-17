import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type BadgeVariant =
  'success' | 'info' | 'warning' | 'danger' | 'neutral';

const VARIANT_BY_STATUS: Record<string, BadgeVariant> = {
  COMPLETED: 'success',
  APPROVED: 'success',
  CLEARED: 'success',
  MATCH: 'success',

  PROCESSING: 'info',
  PENDING_APPROVAL: 'info',
  VALIDATED: 'info',
  INVESTIGATING: 'info',

  CREATED: 'neutral',
  OPEN: 'neutral',

  FAILED: 'danger',
  REJECTED: 'danger',
  CANCELLED: 'danger',
  MISSING: 'danger',
  MISMATCH: 'danger',
  CONFIRMED: 'danger',
};

@Component({
  selector: 'ui-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly status = input.required<string>();

  readonly variant = computed<BadgeVariant>(
    () => VARIANT_BY_STATUS[this.status()] ?? 'neutral',
  );
}
