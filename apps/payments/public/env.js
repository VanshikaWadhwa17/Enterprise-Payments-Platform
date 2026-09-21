// Local dev default. Only used when this MFE is served standalone; once
// federated into the shell, the shell's own env.js is what matters.
window.__env = {
  GRAPHQL_PAYMENTS_URL: 'http://localhost:8080/graphql',
};
