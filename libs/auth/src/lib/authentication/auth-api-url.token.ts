import { InjectionToken } from '@angular/core';

// TODO: move to build-time environment config once the workspace has one;
// see .env.example AUTH_SERVICE_PORT. Same "hardcode it in app.config.ts for
// now" pattern already used for the GraphQL endpoints in provide-graphql.ts.
export const AUTH_API_URL = new InjectionToken<string>('AUTH_API_URL');
