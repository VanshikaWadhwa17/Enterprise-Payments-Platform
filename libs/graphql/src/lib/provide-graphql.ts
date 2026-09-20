import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { xsrfCookieInterceptor } from './xsrf-cookie.interceptor';

export interface GraphQLClientConfig {
  name: string;
  uri: string;
}

/**
 * Registers one Apollo Client per backend service, keyed by name (Apollo
 * Angular "named clients"). Each MFE talks to its own service directly --
 * there is no GraphQL Gateway yet -- so whichever app config actually ends
 * up owning the injector (the shell, once federated) must register every
 * client every routed MFE needs.
 *
 * `withCredentials: true` sends the httpOnly `epp_token` auth cookie with
 * every GraphQL request. `xsrfCookieInterceptor` echoes the `XSRF-TOKEN`
 * cookie back as `X-XSRF-TOKEN`, satisfying the backend's CSRF check (every
 * GraphQL call is a POST, even reads, so this is required even for
 * queries) -- see that file for why Angular's own built-in XSRF support
 * isn't enough here.
 */
export function provideGraphQL(clients: GraphQLClientConfig[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([xsrfCookieInterceptor])),
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);
      const options: Record<string, ApolloClient.Options> = {};

      for (const client of clients) {
        options[client.name] = {
          link: httpLink.create({ uri: client.uri, withCredentials: true }),
          cache: new InMemoryCache(),
        };
      }

      return options;
    }),
  ]);
}
