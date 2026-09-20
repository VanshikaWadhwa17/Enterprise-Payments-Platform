import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

/** For path '': sends authenticated users to /dashboard and everyone else to /login. */
export const rootRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return router.createUrlTree([authService.isAuthenticated() ? '/dashboard' : '/login']);
};
