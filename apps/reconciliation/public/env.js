// Local dev default. Only used when this MFE is served standalone; once
// federated into the shell, the shell's own env.js is what matters.
window.__env = {
  GRAPHQL_RECONCILIATION_URL: 'http://localhost:8085/graphql',
};
