import type { Money } from '@epp/types';

export function formatMoney({ amount, currency }: Money): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
  }).format(amount);
}
