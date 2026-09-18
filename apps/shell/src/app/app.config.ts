import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { appRoutes } from './app.routes';

// TODO: move to build-time environment config once the workspace has one;
// see .env.example GRAPHQL_URL. Registered here (not just in the payments
// app's own config) because Native Federation mounts remote routes into the
// shell's own injector via loadChildren -- the remote's app.config providers
// never apply once its routes are federated in.
const GRAPHQL_URL = 'http://localhost:8080/graphql';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideGraphQL(GRAPHQL_URL),
  ],
};
