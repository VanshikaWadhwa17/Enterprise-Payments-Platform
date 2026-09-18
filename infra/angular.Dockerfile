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

EXPOSE 80
