/**
 * Reads runtime configuration injected as `window.__env` by `public/env.js`
 * (dev default, committed) or `infra/env.template.js` (production,
 * envsubst'd into `env.js` by `infra/40-generate-env-js.sh` when the Docker
 * image starts). `env.js` is always present in every real scenario (dev,
 * docker-compose, cloud), so callers should use the value directly rather
 * than falling back to a hardcoded literal -- a hardcoded `localhost`
 * fallback would ship inside the production bundle forever regardless of
 * whether runtime config actually works, defeating the "no localhost left
 * in the deployed bundle" check. An unset var should fail loudly (an
 * obviously broken request) rather than silently resolve to a
 * plausible-looking wrong URL.
 *
 * Do not call this from a host app's `main.ts` before `initFederation()`
 * resolves -- Native Federation's import map for shared/federated packages
 * (this one included) isn't set up that early, and the import fails to
 * resolve at runtime. `apps/shell/src/main.ts` reads `window.__env` inline
 * instead for exactly this reason.
 */
export function getRuntimeEnv(): Record<string, string> {
  return (window as unknown as { __env?: Record<string, string> }).__env ?? {};
}
