# Weather App

A single-page weather dashboard with animated, weather-specific backgrounds
(clear, clouds, rain, drizzle, snow, thunderstorm, fog), day/night variants,
sunrise/sunset color palettes, and an optional monochrome mode. Built on Next.js
(App Router) and React 19.

There is **no backend** — durable config lives in the URL query string, and
weather data is fetched client-side. The Settings modal also has transient
preview controls for spoofing weather and freezing the displayed time; those
reset on reload. The same build runs in two places:

1. As a [Vercel deploy](#run-on-vercel) you open in a browser.
2. As a [Home Assistant add-on](#run-as-a-home-assistant-add-on) that
   shows up as a sidebar panel inside HA.

Both modes share the exact same Next.js source — there is no fork.

## API keys you'll need

Most providers are optional. The shortest path to a working install is
**Geoapify only**: that gets you the city name + the default OpenMeteo
forecast.

| Provider | Required? | Free tier | Where to sign up | Where to get the key |
|---|---|---|---|---|
| **Geoapify** (geocoding / reverse-geocoding) | Recommended — needed for the city header & zip-code lookup | 3,000 requests/day | <https://www.geoapify.com/get-started-with-maps-api/> | <https://myprojects.geoapify.com/> → project → keys |
| **OpenMeteo** (default forecast provider) | No key needed | Free for personal use | n/a | n/a |
| **OpenWeatherMap** (alternative forecast provider) | Only if you set `weatherSource=OpenWeatherMap` | 1,000 calls/day | <https://home.openweathermap.org/users/sign_up> | <https://home.openweathermap.org/api_keys> — note new keys take a few hours to activate |
| **Ambient Weather Network** (optional local outdoor-temp sensor) | Only if you have an AWN-connected weather station and want its temperature shown | Free for your own data | <https://ambientweather.net/welcome> | After login → **Account** → **API Keys** — needs both an *API Key* and an *Application Key* |

In Vercel/browser usage these go in the URL as `geoapifyApiKey=`,
`openWeatherMapAppId=`, `awnApiKey=`, `awnApplicationKey=` (see param
reference at the bottom of [`test-url.local`](./test-url.local),
gitignored). In the Home Assistant add-on they're supplied via the
addon's **Configuration** tab; see
[`homeassistant/DOCS.md`](./homeassistant/DOCS.md) for the step-by-step.

## Run on Vercel

Standard Next.js 16 app — works on Vercel with no special configuration.
Push the repo to a Vercel project; visit it with a URL like:

```
https://<your-vercel-domain>.vercel.app/?lat=39.58&lon=-105.25&geoapifyApiKey=<geoapify>&weatherSource=OpenMeteo
```

Append `&mono=1` for monochrome mode. The Settings modal (invisible click
target in the top-left corner) lets you tweak things live and save back
into the URL. Its **Fake Time** field freezes the clock and previews the
matching day, night, sunrise, and sunset appearance; clear the field to resume
live time. **Play Day** runs from the selected fake time (2:00 AM by default)
to 10:00 PM at a selectable Slow (2-minute), Medium (60-second), or Fast
(30-second) speed. **Reset to Live** stops playback, clears fake time, and
restores actual weather. Preview controls are session-only and are never
written to the URL.

## Run as a Home Assistant add-on

This repo doubles as a Home Assistant add-on repository. The add-on packs
the same Next.js build into a Docker image and runs it behind HA's
ingress proxy, so it shows up as a sidebar panel without any custom
dashboard setup.

To install:

1. In Home Assistant: **Settings → Add-ons → Add-on Store**.
2. Click the ⋮ menu → **Repositories**, paste this repo's URL, then
   **Add**.
3. Install the **Weather App** add-on, fill in the **Configuration** tab
   (lat/lon, the API keys above, etc.), and **Start** it.

Extras the HA version adds on top of the Vercel deploy:

- **Per-user mono override** — give specific HA users the mono dashboard
  while everyone else keeps color, via the `monochrome_users` option.
- A sidebar panel entry that respects HA's auth.

The add-on files live in [`homeassistant/`](./homeassistant/). The unified
[`CI and release` workflow](./.github/workflows/ci-release.yaml) validates the
app, add-on, integration, and both Docker architectures on every pull request
and `main` push. Nothing about the Vercel deploy changes.

See [`homeassistant/DOCS.md`](./homeassistant/DOCS.md) for the full
options reference + the API-key links repeated with more context.

## Releases

`VERSION` is the shared release version for the Home Assistant add-on and HACS
integration. Keep it equal to `homeassistant/config.yaml` and
`custom_components/weather_app/manifest.json`; CI rejects drift.

After every successful non-`AGENTS.md`-only push to `main`, CI increments the
patch version and commits all three version files. It then publishes the
existing `ghcr.io/jameskorzekwa/weather-app-amd64` and
`ghcr.io/jameskorzekwa/weather-app-aarch64` images with the new version and
`latest` tags. Only after both image pushes succeed does it create the matching
`v<version>` GitHub tag and release used by HACS. The workflow's `GITHUB_TOKEN`
needs repository `contents: write` and `packages: write` access, and branch
rules must allow its version commit.

### Optional: turnkey "Weather" dashboard

The add-on shows up as a sidebar panel, but HA won't let an ingress panel
be your *default* dashboard. The companion
[**Weather App Dashboard** integration](./custom_components/weather_app/)
fixes that: install it via HACS (as an *Integration* custom repository),
and it auto-registers a Lovelace card + a "Weather" dashboard that embeds
the add-on over HA's HTTPS origin — which you *can* then set as your
default dashboard. No HACS card to install by hand, no YAML to paste.

## Local development

```bash
nvm use            # picks up .nvmrc (Node 24.x)
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest + RTL (125 tests)
npm run build      # production build
```

See [`AGENTS.md`](./AGENTS.md) for the project conventions, the test-URL
in [`test-url.local`](./test-url.local) (gitignored, contains real keys
locally) for a working URL with all params plumbed.
