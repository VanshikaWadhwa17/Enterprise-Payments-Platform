import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Permission } from '@epp/types';
import { AuthService } from '../authentication/auth.service';

/**
 * Reads `data: { permission: 'PAYMENT_CREATE' }` or
 * `data: { permissions: ['USER_MANAGE', 'ROLE_MANAGE'] }` (any-of) off the
 * route. Unauthenticated -> /login (401 case); authenticated but missing the
 * permission -> /403 (403 case) -- these are deliberately different
 * redirects, matching the 401-vs-403 distinction the backend also enforces.
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const single = route.data['permission'] as Permission | undefined;
  const anyOf = route.data['permissions'] as Permission[] | undefined;
  const required = single ? [single] : (anyOf ?? []);

  if (required.length === 0 || authService.hasAnyPermission(...required)) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
