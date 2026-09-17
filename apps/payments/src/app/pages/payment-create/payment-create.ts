import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { CreatePayment, Currency } from '@epp/types';
import { Button, Card } from '@epp/ui';
import { PaymentsService } from '../../services/payments.service';

const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP'];

@Component({
  selector: 'epp-payment-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Card, Button],
  templateUrl: './payment-create.html',
  styleUrl: './payment-create.scss',
})
export class PaymentCreate {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly currencies = CURRENCIES;
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    amount: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
    currency: this.fb.control<Currency>('EUR', Validators.required),
    beneficiaryName: this.fb.control('', Validators.required),
    accountNumber: this.fb.control('', Validators.required),
    country: this.fb.control('', [
      Validators.required,
      Validators.maxLength(2),
    ]),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreatePayment = {
      amount: { amount: value.amount, currency: value.currency },
      beneficiary: {
        name: value.beneficiaryName,
        accountNumber: value.accountNumber,
        country: value.country,
      },
    };

    this.submitting.set(true);
    this.error.set(null);

    this.paymentsService.createPayment(payload).subscribe({
      next: (payment) => {
        this.submitting.set(false);
        this.router.navigate(['..', payment.id], { relativeTo: this.route });
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Could not create the payment. Please try again.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
