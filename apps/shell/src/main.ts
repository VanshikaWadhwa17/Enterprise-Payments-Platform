import { initFederation } from '@angular-architects/native-federation';

// Remote entry URLs are runtime configuration, not build-time constants --
// see public/env.js (dev default) / infra/env.template.js (production,
// envsubst'd at container start). Reading window.__env inline here (not via
// @epp/utils's getRuntimeEnv, used everywhere else) because Native
// Federation's import map for shared/federated libraries isn't set up until
// initFederation() below resolves -- importing a federated-shared package
// at the top of main.ts, before that happens, fails to resolve at runtime.
const env: Record<string, string> =
  (window as unknown as { __env?: Record<string, string> }).__env ?? {};

initFederation(
  {
    admin: env['REMOTE_ADMIN_URL'],
    fraud: env['REMOTE_FRAUD_URL'],
    payments: env['REMOTE_PAYMENTS_URL'],
    reconciliation: env['REMOTE_RECONCILIATION_URL'],
    reports: env['REMOTE_REPORTS_URL'],
  },
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
