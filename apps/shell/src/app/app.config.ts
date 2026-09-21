import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { AUTH_API_URL, AuthService } from '@epp/auth';
import { getRuntimeEnv } from '@epp/utils';
import { appRoutes } from './app.routes';

// Backend URLs are runtime configuration -- see public/env.js (dev default)
// / infra/env.template.js (production, envsubst'd at container start).
// Registered here (not just in each remote's own config) because Native
// Federation mounts remote routes into the shell's own injector via
// loadChildren -- a remote's own app.config providers never apply once its
// routes are federated in, so the shell has to know every backend every
// routed MFE needs.
const env = getRuntimeEnv();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideGraphQL([
      { name: 'payments', uri: env['GRAPHQL_PAYMENTS_URL'] },
      { name: 'fraud', uri: env['GRAPHQL_FRAUD_URL'] },
      { name: 'reconciliation', uri: env['GRAPHQL_RECONCILIATION_URL'] },
    ]),
    { provide: AUTH_API_URL, useValue: env['AUTH_API_URL'] },
    // Resolves the current session from the auth cookie (GET /me) before
    // the router evaluates its first guard -- otherwise a hard refresh on
    // a protected route would briefly look unauthenticated and bounce to
    // /login before the cookie check comes back.
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.refreshSession();
    }),
  ],
};
