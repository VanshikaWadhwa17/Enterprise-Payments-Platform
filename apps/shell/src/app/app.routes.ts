import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard, guestGuard, permissionGuard, rootRedirectGuard } from '@epp/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/signup/signup').then((m) => m.Signup),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/authenticated-layout/authenticated-layout').then(
        (m) => m.AuthenticatedLayout,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'payments',
        canActivate: [permissionGuard],
        data: { permission: 'PAYMENT_VIEW' },
        loadChildren: () =>
          loadRemoteModule('payments', './Routes').then((m) => m.appRoutes),
      },
      {
        path: 'fraud',
        canActivate: [permissionGuard],
        data: { permission: 'FRAUD_VIEW' },
        loadChildren: () =>
          loadRemoteModule('fraud', './Routes').then((m) => m.appRoutes),
      },
      {
        path: 'reconciliation',
        canActivate: [permissionGuard],
        data: { permission: 'RECONCILIATION_VIEW' },
        loadChildren: () =>
          loadRemoteModule('reconciliation', './Routes').then((m) => m.appRoutes),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_VIEW' },
        loadComponent: () =>
          loadRemoteModule('reports', './Component').then((m) => m.App),
      },
      {
        path: 'admin',
        canActivate: [permissionGuard],
        data: { permissions: ['USER_MANAGE', 'ROLE_MANAGE'] },
        loadComponent: () =>
          loadRemoteModule('admin', './Component').then((m) => m.App),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.Settings),
      },
      {
        path: '403',
        loadComponent: () =>
          import('./pages/access-denied/access-denied').then((m) => m.AccessDenied),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
