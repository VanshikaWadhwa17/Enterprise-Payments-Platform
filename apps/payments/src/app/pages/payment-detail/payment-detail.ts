import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { formatMoney } from '@epp/utils';
import { Button, Card, StatusBadge } from '@epp/ui';
import { PaymentsService } from '../../services/payments.service';

@Component({
  selector: 'epp-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, StatusBadge, Button, DatePipe],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.scss',
})
export class PaymentDetail {
  private readonly paymentsService = inject(PaymentsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly id = input.required<string>();
  readonly loading = signal(true);

  private readonly id$ = toObservable(this.id);

  readonly payment = toSignal(
    this.id$.pipe(
      tap(() => this.loading.set(true)),
      switchMap((id) => this.paymentsService.getPayment(id)),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: undefined },
  );

  readonly formatMoney = formatMoney;

  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
