import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGraphQL } from '@epp/graphql';
import { appRoutes } from './app.routes';

// TODO: move to build-time environment config once the workspace has one;
// see .env.example GRAPHQL_URL.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideGraphQL([{ name: 'reconciliation', uri: 'http://localhost:8085/graphql' }]),
  ],
};
