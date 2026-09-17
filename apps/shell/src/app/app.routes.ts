import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'payments' },
  {
    path: 'payments',
    loadComponent: () =>
      loadRemoteModule('payments', './Component').then((m) => m.App),
  },
  {
    path: 'fraud',
    loadComponent: () =>
      loadRemoteModule('fraud', './Component').then((m) => m.App),
  },
  {
    path: 'reconciliation',
    loadComponent: () =>
      loadRemoteModule('reconciliation', './Component').then((m) => m.App),
  },
  {
    path: 'reports',
    loadComponent: () =>
      loadRemoteModule('reports', './Component').then((m) => m.App),
  },
  {
    path: 'admin',
    loadComponent: () =>
      loadRemoteModule('admin', './Component').then((m) => m.App),
  },
];
