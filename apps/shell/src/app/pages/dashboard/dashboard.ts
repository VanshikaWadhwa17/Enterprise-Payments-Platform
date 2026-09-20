import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@epp/auth';
import type { Permission } from '@epp/types';
import { Card } from '@epp/ui';

interface QuickLink {
  path: string;
  label: string;
  description: string;
  permission?: Permission;
  anyOfPermissions?: Permission[];
}

const QUICK_LINKS: QuickLink[] = [
  {
    path: '/payments',
    label: 'Payments',
    description: 'View and create cross-border payments.',
    permission: 'PAYMENT_VIEW',
  },
  {
    path: '/fraud',
    label: 'Fraud',
    description: 'Review and act on flagged fraud cases.',
    permission: 'FRAUD_VIEW',
  },
  {
    path: '/reconciliation',
    label: 'Reconciliation',
    description: 'Reconcile payments against settlement records.',
    permission: 'RECONCILIATION_VIEW',
  },
  {
    path: '/reports',
    label: 'Reports',
    description: 'Review operational and compliance reports.',
    permission: 'REPORT_VIEW',
  },
  {
    path: '/admin',
    label: 'Administration',
    description: 'Manage users and roles.',
    anyOfPermissions: ['USER_MANAGE', 'ROLE_MANAGE'],
  },
];

@Component({
  selector: 'epp-dashboard',
  imports: [RouterModule, Card],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly quickLinks = computed(() =>
    QUICK_LINKS.filter((link) => {
      if (link.permission) {
        return this.authService.hasPermission(link.permission);
      }
      if (link.anyOfPermissions) {
        return this.authService.hasAnyPermission(...link.anyOfPermissions);
      }
      return true;
    }),
  );
}
