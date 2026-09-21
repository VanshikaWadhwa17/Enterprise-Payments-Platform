# Shared Dockerfile for every Angular MFE. Build with:
#   docker build -f infra/angular.Dockerfile --build-arg APP_NAME=shell .
# Needs the whole workspace as build context (NX resolves the full project
# graph), not just the one app's directory.

FROM node:20-alpine AS build
ARG APP_NAME
WORKDIR /workspace

COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json ./
COPY apps apps
COPY libs libs

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --frozen-lockfile

RUN pnpm exec nx build ${APP_NAME} --configuration=production

FROM nginx:alpine AS runtime
ARG APP_NAME
COPY --from=build /workspace/dist/apps/${APP_NAME}/browser /usr/share/nginx/html
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf

# Regenerates env.js from real environment variables at container start,
# overwriting the dev-default env.js baked in above -- same image works
# locally (docker-compose sets these to localhost values) and in the cloud
# (set to the deployed backend's URLs) with no rebuild. See
# infra/env.template.js / infra/40-generate-env-js.sh.
COPY infra/env.template.js /usr/share/nginx/html/env.template.js
COPY infra/40-generate-env-js.sh /docker-entrypoint.d/40-generate-env-js.sh
RUN chmod +x /docker-entrypoint.d/40-generate-env-js.sh

EXPOSE 80
