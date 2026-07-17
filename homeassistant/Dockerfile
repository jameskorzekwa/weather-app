# Home Assistant add-on Dockerfile for the weather-app.
#
# Build context is the *repository root* — the workflow in
# .github/workflows/ci-release.yaml passes `--build-arg BUILD_FROM=...` and sets
# the context to `.` so we can COPY the Next.js sources from one level up.
#
# Two stages:
#   1. builder — runs `npm ci && npm run build` on a stock node:alpine image.
#   2. runtime — a slim image with Node + nginx; nginx terminates HA's
#      ingress traffic, rewrites asset URLs for the dynamic ingress path,
#      and proxies everything to `next start` on :3000.

# BUILD_FROM must be declared GLOBALLY (before any FROM) so it can be used
# in the runtime stage's FROM below. An ARG declared inside a stage is
# scoped to that stage only — BuildKit reports "UndefinedArgInFrom" if you
# try to use it from a subsequent FROM. See:
# https://docs.docker.com/reference/dockerfile/#understand-how-arg-and-from-interact
ARG BUILD_FROM=node:24-alpine

# ---- Stage 1: build the Next.js app -----------------------------------------
FROM node:24-alpine AS builder

WORKDIR /build

# Install all deps (incl. dev) so `next build` works.
#
# Uses `npm install` (not `npm ci`) on purpose: the committed lockfile is
# generated on macOS and is missing actual `packages` entries for some
# wasm32-wasi optional transitive deps (@emnapi/runtime@1.10.0 pinned by
# @rolldown/binding-wasm32-wasi and @tailwindcss/oxide-wasm32-wasi), so
# `npm ci` fails inside alpine/musl with "Missing: ... from lock file".
# `npm install` honors the lockfile as a starting point but resolves the
# missing entries from the registry instead of erroring out. Vercel and
# the Tests workflow keep using `npm ci` where the platform happens to
# match what the macOS-generated lockfile pinned.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Ensure the public/ directory exists so the runtime-stage COPY below
# doesn't fail when public/ is empty. The repo's `public/` is an empty
# directory and git doesn't track empty directories, so on a CI checkout
# it doesn't exist at all — `mkdir -p` makes the COPY tolerate that.
RUN mkdir -p /build/public

# Bring in the rest of the sources and produce the production build.
#
# Heads-up for local testing on Apple Silicon: running this Dockerfile with
# `docker buildx build --platform linux/amd64` on an M-series Mac will fail
# here with "Initiated Worker with invalid NODE_OPTIONS env variable:
# --no-opt is not allowed in NODE_OPTIONS". That `--no-opt` is injected by
# Docker Desktop's Rosetta emulator (it disables V8's JIT when emulating
# amd64), and it sneaks into `process.execArgv` so Next.js's worker spawn
# rejects it. Build `--platform linux/arm64` locally instead, or just let
# CI build amd64 on a native amd64 runner where Rosetta isn't in play.
COPY . .
RUN npm run build

# Drop dev deps from node_modules so the runtime image stays small.
RUN npm prune --omit=dev


# ---- Stage 2: runtime image -------------------------------------------------
# Uses BUILD_FROM declared at the top of this file. The GitHub Actions
# workflow (see .github/workflows/ci-release.yaml) and Home Assistant's local
# builder (via build.yaml) both pass BUILD_FROM as a build arg; if neither
# is in play the global default (node:24-alpine) is used.
FROM ${BUILD_FROM}

# `nodejs` + `npm` are only present on the node:* base; on HA base images we
# need to install them. `apk add` is idempotent so it's safe either way.
# nginx terminates ingress traffic; jq parses /data/options.json; tini gives
# us proper signal handling for the two child processes.
RUN apk add --no-cache nodejs npm nginx jq tini bash \
    && mkdir -p /run/nginx /var/log/nginx /var/lib/nginx/tmp \
    && chown -R nginx:nginx /var/lib/nginx /var/log/nginx /run/nginx

WORKDIR /app

# Copy the production-pruned Next.js app from the builder.
COPY --from=builder /build/.next         ./.next
COPY --from=builder /build/node_modules  ./node_modules
COPY --from=builder /build/public        ./public
COPY --from=builder /build/package.json  ./package.json
COPY --from=builder /build/next.config.mjs ./next.config.mjs

# Add-on glue: nginx config + startup script. The template is what we ship;
# run.sh generates the live nginx.conf from it on every container start so
# repeated restarts produce the same result (sed -i would not be idempotent
# against an already-substituted file).
COPY homeassistant/nginx.conf /etc/nginx/nginx.conf.template
COPY homeassistant/run.sh     /run.sh
RUN chmod +x /run.sh

# HA's default ingress port is 8099. Anything inside the container that is
# reachable from HA must be bound to this port — only nginx is, so we expose
# it for documentation.
EXPOSE 8099

# Labels expected by HA Supervisor / community add-on tooling.
ARG BUILD_ARCH
ARG BUILD_VERSION
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_DESCRIPTION="Weather app — animated weather backgrounds in your HA sidebar"
ARG BUILD_NAME="Weather App"
ARG BUILD_REPOSITORY
LABEL \
    io.hass.name="${BUILD_NAME}" \
    io.hass.description="${BUILD_DESCRIPTION}" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version="${BUILD_VERSION}" \
    maintainer="James Korzekwa <james.korzekwa@gmail.com>" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.source="${BUILD_REPOSITORY}" \
    org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.revision="${BUILD_REF}" \
    org.opencontainers.image.version="${BUILD_VERSION}"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/run.sh"]
