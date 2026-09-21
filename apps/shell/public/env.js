// Local dev default. In Docker builds this file is generated at container
// start from infra/env.template.js by infra/40-generate-env-js.sh, so the
// same image can point at a different backend without a rebuild -- see
// infra/angular.Dockerfile. On Vercel it's generated at build time instead
// by scripts/generate-env-js.mjs (no persistent container to hook into).
window.__env = {
  GRAPHQL_PAYMENTS_URL: 'http://localhost:8080/graphql',
  GRAPHQL_FRAUD_URL: 'http://localhost:8082/graphql',
  GRAPHQL_RECONCILIATION_URL: 'http://localhost:8085/graphql',
  AUTH_API_URL: 'http://localhost:8086',
  REMOTE_PAYMENTS_URL: 'http://localhost:4201/remoteEntry.json',
  REMOTE_FRAUD_URL: 'http://localhost:4202/remoteEntry.json',
  REMOTE_RECONCILIATION_URL: 'http://localhost:4203/remoteEntry.json',
  REMOTE_REPORTS_URL: 'http://localhost:4204/remoteEntry.json',
  REMOTE_ADMIN_URL: 'http://localhost:4205/remoteEntry.json',
};
