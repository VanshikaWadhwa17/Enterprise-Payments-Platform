import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/fraud-list/fraud-list').then((m) => m.FraudList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/fraud-detail/fraud-detail').then((m) => m.FraudDetail),
  },
];
