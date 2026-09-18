import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reconciliation-list/reconciliation-list').then((m) => m.ReconciliationList),
  },
];
