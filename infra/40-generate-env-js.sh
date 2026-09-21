#!/bin/sh
# Runs automatically before nginx starts (nginx's own docker-entrypoint.sh
# executes every executable /docker-entrypoint.d/*.sh in order). Renders
# env.template.js into env.js using real environment variables, overwriting
# the dev-default env.js that got baked in from the Angular build's public/
# folder. Explicit var list passed to envsubst so it only substitutes these
# names and leaves any other literal `$` in the template alone.
set -eu

envsubst '${GRAPHQL_PAYMENTS_URL} ${GRAPHQL_FRAUD_URL} ${GRAPHQL_RECONCILIATION_URL} ${AUTH_API_URL} ${REMOTE_PAYMENTS_URL} ${REMOTE_FRAUD_URL} ${REMOTE_RECONCILIATION_URL} ${REMOTE_REPORTS_URL} ${REMOTE_ADMIN_URL}' \
  < /usr/share/nginx/html/env.template.js \
  > /usr/share/nginx/html/env.js
