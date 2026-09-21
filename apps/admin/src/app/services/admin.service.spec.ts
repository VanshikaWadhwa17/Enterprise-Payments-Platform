import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AUTH_API_URL } from '@epp/auth';
import type { User } from '@epp/types';
import { AdminService } from './admin.service';

const AUTH_API_URL_VALUE = 'http://localhost:8086';

const USER: User = {
  id: 'user-1',
  fullName: 'Erin Viewer',
  email: 'erin@epp.dev',
  role: 'VIEWER',
  enabled: true,
};

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_API_URL, useValue: AUTH_API_URL_VALUE },
      ],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists users with credentials', () => {
    service.listUsers().subscribe((users) => {
      expect(users).toEqual([USER]);
    });

    const req = httpMock.expectOne(`${AUTH_API_URL_VALUE}/api/auth/users`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush([USER]);
  });

  it('sends a role change as a PATCH with the new role', () => {
    const updated = { ...USER, role: 'PAYMENT_ANALYST' as const };
    service.updateRole('user-1', 'PAYMENT_ANALYST').subscribe((user) => {
      expect(user).toEqual(updated);
    });

    const req = httpMock.expectOne(`${AUTH_API_URL_VALUE}/api/auth/users/user-1/role`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'PAYMENT_ANALYST' });
    expect(req.request.withCredentials).toBe(true);
    req.flush(updated);
  });

  it('sends a status change as a PATCH with the new enabled flag', () => {
    const updated = { ...USER, enabled: false };
    service.updateStatus('user-1', false).subscribe((user) => {
      expect(user).toEqual(updated);
    });

    const req = httpMock.expectOne(`${AUTH_API_URL_VALUE}/api/auth/users/user-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush(updated);
  });
});
