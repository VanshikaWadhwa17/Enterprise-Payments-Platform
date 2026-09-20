import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import type { Permission, Role, User } from '@epp/types';
import { roleHasPermission } from '../permissions/permissions';
import { AUTH_API_URL } from './auth-api-url.token';

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Talks to auth-service for real login/signup/logout, and centralizes
 * authorization checks (hasRole/hasPermission/hasAnyPermission) so
 * components never hardcode role/permission logic themselves.
 *
 * The access token lives in an httpOnly cookie set by auth-service --
 * this service never sees or stores it directly. `currentUser` is
 * populated from auth-service's /me endpoint instead of decoding a token.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authApiUrl = inject(AUTH_API_URL);

  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.authApiUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  signup(payload: SignupPayload): Observable<User> {
    return this.http
      .post<User>(`${this.authApiUrl}/api/auth/signup`, payload, {
        withCredentials: true,
      })
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.authApiUrl}/api/auth/logout`, null, {
        withCredentials: true,
      })
      .pipe(tap(() => this.currentUserSignal.set(null)));
  }

  /** Restores `currentUser` from the auth cookie. Called once at app bootstrap. */
  refreshSession(): Observable<User | null> {
    return this.http
      .get<User>(`${this.authApiUrl}/api/auth/me`, { withCredentials: true })
      .pipe(
        tap((user) => this.currentUserSignal.set(user)),
        catchError(() => {
          this.currentUserSignal.set(null);
          return of(null);
        }),
      );
  }

  hasRole(role: Role): boolean {
    return this.currentUserSignal()?.role === role;
  }

  hasPermission(permission: Permission): boolean {
    const user = this.currentUserSignal();
    return user !== null && roleHasPermission(user.role, permission);
  }

  hasAnyPermission(...permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }
}
