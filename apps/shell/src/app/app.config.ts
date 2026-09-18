import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { appRoutes } from './app.routes';

// TODO: move to build-time environment config once the workspace has one;
// see .env.example GRAPHQL_URL. Registered here (not just in each remote's
// own config) because Native Federation mounts remote routes into the
// shell's own injector via loadChildren -- a remote's own app.config
// providers never apply once its routes are federated in, so the shell has
// to know every backend every routed MFE needs.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideGraphQL([
      { name: 'payments', uri: 'http://localhost:8080/graphql' },
      { name: 'fraud', uri: 'http://localhost:8082/graphql' },
      { name: 'reconciliation', uri: 'http://localhost:8085/graphql' },
    ]),
  ],
};
