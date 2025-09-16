# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.17.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV="production"

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

#COPY package-lock.json package.json ./
COPY client/package-lock.json client/package.json ./

# 🔑 peer dependency 충돌 무시
RUN npm ci --include=dev --legacy-peer-deps

COPY client/ .

# .env.local도 루트 기준 경로로 지정
COPY client/.env.production .env.production

RUN npx next build --experimental-build-mode compile

# 🔑 prune 시에도 충돌 무시
RUN npm prune --omit=dev --legacy-peer-deps || true

FROM base
COPY --from=build /app /app

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
