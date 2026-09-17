import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'payments' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'payments',
    loadChildren: () =>
      loadRemoteModule('payments', './Routes').then((m) => m.appRoutes),
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
