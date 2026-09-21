#!/usr/bin/env node
// Generates public/env.js at Vercel build time from real environment
// variables (set per-project in the Vercel dashboard). This is the Vercel
// equivalent of infra/40-generate-env-js.sh, which does the same thing at
// container start for Railway/Docker deployments -- Vercel has no
// persistent container to hook a startup script into, so this runs once
// per build instead. Overwrites the dev-default apps/<app>/public/env.js
// before `nx build` copies public/ into the output directory.
import { writeFileSync } from 'node:fs';

const appName = process.argv[2];
if (!appName) {
  console.error('Usage: node scripts/generate-env-js.mjs <app-name>');
  process.exit(1);
}

const VARS = [
  'GRAPHQL_PAYMENTS_URL',
  'GRAPHQL_FRAUD_URL',
  'GRAPHQL_RECONCILIATION_URL',
  'AUTH_API_URL',
  'REMOTE_PAYMENTS_URL',
  'REMOTE_FRAUD_URL',
  'REMOTE_RECONCILIATION_URL',
  'REMOTE_REPORTS_URL',
  'REMOTE_ADMIN_URL',
];

const entries = VARS.map(
  (key) => `  ${key}: ${JSON.stringify(process.env[key] ?? '')},`,
).join('\n');

const contents = `// Generated at Vercel build time by scripts/generate-env-js.mjs -- see
// infra/40-generate-env-js.sh for the equivalent Railway/Docker mechanism.
window.__env = {
${entries}
};
`;

writeFileSync(`apps/${appName}/public/env.js`, contents);
console.log(`Wrote apps/${appName}/public/env.js`);
