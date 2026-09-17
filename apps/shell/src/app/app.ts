import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'epp-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Enterprise Payments Platform';
  protected readonly navItems = [
    { path: 'payments', label: 'Payments' },
    { path: 'fraud', label: 'Fraud' },
    { path: 'reconciliation', label: 'Reconciliation' },
    { path: 'reports', label: 'Reports' },
    { path: 'admin', label: 'Admin' },
  ];
}
