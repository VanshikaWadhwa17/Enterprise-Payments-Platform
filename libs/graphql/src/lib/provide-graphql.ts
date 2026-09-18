import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

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
 */
export function provideGraphQL(clients: GraphQLClientConfig[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);
      const options: Record<string, ApolloClient.Options> = {};

      for (const client of clients) {
        options[client.name] = {
          link: httpLink.create({ uri: client.uri }),
          cache: new InMemoryCache(),
        };
      }

      return options;
    }),
  ]);
}
