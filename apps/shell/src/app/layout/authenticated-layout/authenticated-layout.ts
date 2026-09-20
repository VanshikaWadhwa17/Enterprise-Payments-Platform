import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { AuthService } from '@epp/auth';
import type { Permission } from '@epp/types';

interface NavItem {
  path: string;
  label: string;
  permission?: Permission;
  anyOfPermissions?: Permission[];
}

const NAV_ITEMS: NavItem[] = [
  { path: 'dashboard', label: 'Dashboard' },
  { path: 'payments', label: 'Payments', permission: 'PAYMENT_VIEW' },
  { path: 'fraud', label: 'Fraud', permission: 'FRAUD_VIEW' },
  { path: 'reconciliation', label: 'Reconciliation', permission: 'RECONCILIATION_VIEW' },
  { path: 'reports', label: 'Reports', permission: 'REPORT_VIEW' },
  {
    path: 'admin',
    label: 'Administration',
    anyOfPermissions: ['USER_MANAGE', 'ROLE_MANAGE'],
  },
  { path: 'settings', label: 'Settings' },
];

// Named Apollo clients registered in app.config.ts -- kept in one place here
// since that's the only spot that already knows all of them.
const NAMED_APOLLO_CLIENTS = ['payments', 'fraud', 'reconciliation'];

@Component({
  selector: 'epp-authenticated-layout',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.scss',
})
export class AuthenticatedLayout {
  private readonly authService = inject(AuthService);
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);

  protected readonly title = 'Enterprise Payments Platform';
  protected readonly currentUser = this.authService.currentUser;

  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => {
      if (item.permission) {
        return this.authService.hasPermission(item.permission);
      }
      if (item.anyOfPermissions) {
        return this.authService.hasAnyPermission(...item.anyOfPermissions);
      }
      return true;
    }),
  );

  logout(): void {
    this.authService.logout().subscribe(() => {
      for (const clientName of NAMED_APOLLO_CLIENTS) {
        this.apollo.use(clientName).client.clearStore();
      }
      this.router.navigateByUrl('/login');
    });
  }
}
