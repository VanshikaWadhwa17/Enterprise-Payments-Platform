import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import type { Currency, FraudCase } from '@epp/types';
import { formatMoney } from '@epp/utils';
import { Button, Card, StatusBadge } from '@epp/ui';
import { FraudService } from '../../services/fraud.service';

@Component({
  selector: 'epp-fraud-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, StatusBadge, Button],
  templateUrl: './fraud-detail.html',
  styleUrl: './fraud-detail.scss',
})
export class FraudDetail {
  private readonly fraudService = inject(FraudService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly id = input.required<string>();
  readonly loading = signal(true);
  readonly actioning = signal(false);

  private readonly refresh = signal(0);

  private readonly trigger$ = combineLatest([toObservable(this.id), toObservable(this.refresh)]).pipe(
    map(([id]) => id),
  );

  readonly fraudCase = toSignal(
    this.trigger$.pipe(
      tap(() => this.loading.set(true)),
      switchMap((id) => this.fraudService.getFraudCase(id)),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: undefined as FraudCase | undefined },
  );

  readonly formatMoney = (amount: number, currency: string) =>
    formatMoney({ amount, currency: currency as Currency });

  investigate(): void {
    this.runAction((id) => this.fraudService.investigate(id));
  }

  approve(): void {
    this.runAction((id) => this.fraudService.approve(id));
  }

  block(): void {
    this.runAction((id) => this.fraudService.block(id));
  }

  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private runAction(action: (id: string) => ReturnType<FraudService['approve']>): void {
    this.actioning.set(true);
    action(this.id()).subscribe({
      next: () => {
        this.actioning.set(false);
        this.refresh.update((n) => n + 1);
      },
      error: () => this.actioning.set(false),
    });
  }
}
