import { initFederation } from '@angular-architects/native-federation';

initFederation(
  {
    admin: 'http://localhost:4205/remoteEntry.json',
    fraud: 'http://localhost:4202/remoteEntry.json',
    payments: 'http://localhost:4201/remoteEntry.json',
    reconciliation: 'http://localhost:4203/remoteEntry.json',
    reports: 'http://localhost:4204/remoteEntry.json',
  },
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
