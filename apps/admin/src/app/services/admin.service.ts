import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { Role, User } from '@epp/types';
import { AUTH_API_URL } from '@epp/auth';

/**
 * REST, not GraphQL -- auth-service has no GraphQL schema, and this mirrors
 * how AuthService (@epp/auth) already talks to it for login/signup/me.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly authApiUrl = inject(AUTH_API_URL);

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.authApiUrl}/api/auth/users`, {
      withCredentials: true,
    });
  }

  updateRole(id: string, role: Role): Observable<User> {
    return this.http.patch<User>(
      `${this.authApiUrl}/api/auth/users/${id}/role`,
      { role },
      { withCredentials: true },
    );
  }

  updateStatus(id: string, enabled: boolean): Observable<User> {
    return this.http.patch<User>(
      `${this.authApiUrl}/api/auth/users/${id}/status`,
      { enabled },
      { withCredentials: true },
    );
  }
}
