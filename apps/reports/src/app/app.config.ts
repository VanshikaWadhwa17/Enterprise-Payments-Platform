import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { getRuntimeEnv } from '@epp/utils';
import { appRoutes } from './app.routes';

// Only used when this MFE is served standalone (e.g. `nx serve reports`);
// once federated into the shell, the shell's own app.config provides this
// instead. See public/env.js (dev default) / infra/env.template.js
// (production) for how the URLs are injected.
const env = getRuntimeEnv();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideGraphQL([
      { name: 'payments', uri: env['GRAPHQL_PAYMENTS_URL'] },
      { name: 'fraud', uri: env['GRAPHQL_FRAUD_URL'] },
      { name: 'reconciliation', uri: env['GRAPHQL_RECONCILIATION_URL'] },
    ]),
  ],
};
