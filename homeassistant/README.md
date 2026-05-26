# Weather App — Home Assistant add-on

A sidebar panel that mirrors the Vercel-hosted Weather App: animated
weather backgrounds, current conditions, a 5-day forecast, and an optional
monochrome mode.

The add-on runs the same Next.js build that ships to Vercel — there is no
forked codebase. Configuration (API keys, location) is supplied through the
HA Configuration tab and injected into the app via URL parameters at
startup, so behaviour is identical to opening the Vercel deploy with the
same `?lat=...&apikey=...` URL.

## Install

1. In Home Assistant: **Settings → Add-ons → Add-on Store**.
2. Click the ⋮ menu top-right → **Repositories**, paste this repo's URL,
   then **Add**.
3. The Weather App add-on now appears in the store. Install it — HA pulls
   the pre-built image from GHCR, so install is fast.
4. Open the **Configuration** tab and fill in the fields you care about
   (see [DOCS.md](./DOCS.md) for the full list).
5. **Start** the add-on. A "Weather" entry will appear in the HA sidebar.

## How it works

- `Dockerfile` builds the Next.js app and serves it with `next start` on
  the container's internal port 3000.
- `nginx.conf` reverse-proxies the HA ingress port (8099) to Next.js and
  rewrites `/_next/...` / `/api/...` references in HTML and JS so they
  resolve through HA's dynamic ingress path.
- `run.sh` reads `/data/options.json`, builds the query string the app
  expects, and points the root URL at `/?<params>` before launching
  Next.js + nginx.

See [`../AGENTS.md`](../AGENTS.md) for everything else about the app
itself.
