import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '@epp/auth';
import type { Role, User } from '@epp/types';
import { Button, EmptyState, ErrorState, Spinner, Table, type TableColumn } from '@epp/ui';
import { AdminService } from './services/admin.service';

const ROLES: Role[] = ['ADMIN', 'OPERATIONS_MANAGER', 'PAYMENT_ANALYST', 'FRAUD_ANALYST', 'VIEWER'];

const COLUMNS: TableColumn<User>[] = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'enabled', label: 'Status', format: (value) => (value ? 'Enabled' : 'Disabled') },
];

@Component({
  selector: 'epp-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Spinner, EmptyState, ErrorState, Button],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);

  protected readonly columns = COLUMNS;
  protected readonly roles = ROLES;

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canManageRole = computed(() => this.authService.hasPermission('ROLE_MANAGE'));
  protected readonly canManageStatus = computed(() =>
    this.authService.hasPermission('USER_MANAGE'),
  );
  protected readonly currentUserId = computed(() => this.authService.currentUser()?.id);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load users right now.');
        this.loading.set(false);
      },
    });
  }

  isSelf(user: User): boolean {
    return user.id === this.currentUserId();
  }

  changeRole(user: User, role: Role): void {
    if (role === user.role || this.isSelf(user)) {
      return;
    }
    this.adminService.updateRole(user.id, role).subscribe({
      next: (updated) => this.replaceUser(updated),
      error: () => this.error.set(`Unable to update ${user.fullName}'s role right now.`),
    });
  }

  toggleStatus(user: User): void {
    if (this.isSelf(user)) {
      return;
    }
    this.adminService.updateStatus(user.id, !user.enabled).subscribe({
      next: (updated) => this.replaceUser(updated),
      error: () => this.error.set(`Unable to update ${user.fullName}'s status right now.`),
    });
  }

  private replaceUser(updated: User): void {
    this.users.set(this.users().map((user) => (user.id === updated.id ? updated : user)));
  }
}
