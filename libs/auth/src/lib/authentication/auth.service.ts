import { Injectable, computed, signal } from '@angular/core';
import type { Permission, Role, User } from '@epp/types';
import { roleHasPermission } from '../permissions/permissions';

const SESSION_STORAGE_KEY = 'epp.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(
    this.restoreSession(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(username: string, role: Role): User {
    const user: User = {
      id: `${role}:${username}`.toLowerCase(),
      username,
      displayName: username,
      role,
    };

    this.currentUserSignal.set(user);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));

    return user;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  hasPermission(permission: Permission): boolean {
    const user = this.currentUserSignal();
    return user !== null && roleHasPermission(user.role, permission);
  }

  private restoreSession(): User | null {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
