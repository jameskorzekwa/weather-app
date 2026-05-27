# Weather App — Home Assistant add-on

A sidebar panel that mirrors the Vercel-hosted Weather App: animated
weather backgrounds, current conditions, a 5-day forecast, and an optional
monochrome mode (global, or scoped to specific HA users).

The add-on runs the same Next.js build that ships to Vercel — there is no
forked codebase. Configuration (API keys, location) is supplied through the
HA Configuration tab and injected into the app via URL parameters at
startup, so behaviour is identical to opening the Vercel deploy with the
same `?lat=...&geoapifyApiKey=...` URL.

## Install

1. In Home Assistant: **Settings → Add-ons → Add-on Store**.
2. Click the ⋮ menu top-right → **Repositories**, paste this repo's URL,
   then **Add**.
3. The Weather App add-on now appears in the store. Install it — HA pulls
   the pre-built image from GHCR, so install is fast.
4. Open the **Configuration** tab and fill in the fields you care about.
   See [DOCS.md](./DOCS.md) for the full option list **and the step-by-
   step on where to get each API key** (Geoapify, OpenMeteo,
   OpenWeatherMap, Ambient Weather Network).
5. **Start** the add-on. A "Weather" entry will appear in the HA sidebar.

The minimum config to see real data: a `geoapify_api_key` and either
`latitude`/`longitude` or a `zipcode`. Everything else is optional.

## How it works

- `Dockerfile` builds the Next.js app and serves it with `next start` on
  the container's internal port 3000.
- `nginx.conf` reverse-proxies the HA ingress port (8099) to Next.js and
  rewrites `/_next/...` / `/api/...` references in HTML and JS so they
  resolve through HA's dynamic ingress path. A `map` on the
  `X-Remote-User-Display-Name` ingress header drives the per-user
  monochrome override.
- `run.sh` reads `/data/options.json`, builds the query string the app
  expects, generates the per-user mono map block, and patches both into
  `nginx.conf` before launching Next.js + nginx.

See [`../AGENTS.md`](../AGENTS.md) for everything else about the app
itself.
