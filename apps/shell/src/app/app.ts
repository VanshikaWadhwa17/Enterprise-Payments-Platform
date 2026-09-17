import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@epp/auth';

@Component({
  imports: [RouterModule],
  selector: 'epp-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly title = 'Enterprise Payments Platform';
  protected readonly navItems = [
    { path: 'payments', label: 'Payments' },
    { path: 'fraud', label: 'Fraud' },
    { path: 'reconciliation', label: 'Reconciliation' },
    { path: 'reports', label: 'Reports' },
    { path: 'admin', label: 'Admin' },
  ];

  protected readonly currentUser = this.authService.currentUser;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
