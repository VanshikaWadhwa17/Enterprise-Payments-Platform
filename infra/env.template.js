// envsubst template for the runtime config each Angular MFE reads as
// window.__env (see libs/utils/src/lib/runtime-config/get-runtime-env.ts).
// infra/40-generate-env-js.sh renders this into env.js at container start,
// overwriting the dev-default env.js baked in from each app's public/
// folder at build time. Shared by every frontend image (APP_NAME varies,
// this template doesn't) -- a var a given app doesn't consume just
// resolves to an empty string for that container, harmlessly.
window.__env = {
  GRAPHQL_PAYMENTS_URL: "${GRAPHQL_PAYMENTS_URL}",
  GRAPHQL_FRAUD_URL: "${GRAPHQL_FRAUD_URL}",
  GRAPHQL_RECONCILIATION_URL: "${GRAPHQL_RECONCILIATION_URL}",
  AUTH_API_URL: "${AUTH_API_URL}",
  REMOTE_PAYMENTS_URL: "${REMOTE_PAYMENTS_URL}",
  REMOTE_FRAUD_URL: "${REMOTE_FRAUD_URL}",
  REMOTE_RECONCILIATION_URL: "${REMOTE_RECONCILIATION_URL}",
  REMOTE_REPORTS_URL: "${REMOTE_REPORTS_URL}",
  REMOTE_ADMIN_URL: "${REMOTE_ADMIN_URL}",
};
