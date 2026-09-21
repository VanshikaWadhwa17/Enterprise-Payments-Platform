import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { getRuntimeEnv } from '@epp/utils';
import { appRoutes } from './app.routes';

// Only used when this MFE is served standalone (e.g. `nx serve payments`);
// once federated into the shell, the shell's own app.config providers this
// instead. See public/env.js / infra/env.template.js for how the URL is
// injected.
const env = getRuntimeEnv();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideGraphQL([{ name: 'payments', uri: env['GRAPHQL_PAYMENTS_URL'] }]),
  ],
};
