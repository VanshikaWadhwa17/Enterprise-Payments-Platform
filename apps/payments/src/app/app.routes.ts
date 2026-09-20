import { Route } from '@angular/router';
import { permissionGuard } from '@epp/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payment-list/payment-list').then((m) => m.PaymentList),
  },
  {
    path: 'create',
    canActivate: [permissionGuard],
    data: { permission: 'PAYMENT_CREATE' },
    loadComponent: () =>
      import('./pages/payment-create/payment-create').then(
        (m) => m.PaymentCreate,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/payment-detail/payment-detail').then(
        (m) => m.PaymentDetail,
      ),
  },
];
