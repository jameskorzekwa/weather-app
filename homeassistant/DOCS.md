# Weather App add-on — documentation

This page is shown inside Home Assistant on the add-on's **Documentation**
tab.

## Configuration

All fields below are optional — the app falls back to the same defaults as
the Vercel deploy. Anything you leave blank simply doesn't get injected
into the URL.

| Option                  | Type     | Notes                                                        |
|-------------------------|----------|--------------------------------------------------------------|
| `latitude`              | float    | Decimal degrees. Used together with `longitude`.             |
| `longitude`             | float    | Decimal degrees.                                             |
| `zipcode`               | string   | Fallback location if lat/lon are blank.                      |
| `geoapify_api_key`      | password | Geoapify key, used for geocoding / reverse-geocoding.        |
| `openweathermap_appid`  | password | Only needed if `weather_source` is `OpenWeatherMap`.         |
| `awn_api_key`           | password | Ambient Weather Network key (local temp sensor).             |
| `awn_application_key`   | password | Ambient Weather Network *application* key.                   |
| `weather_source`        | list     | `OpenMeteo` (default) or `OpenWeatherMap`.                   |
| `monochrome`            | bool     | When `true` the app boots in monochrome mode (`?mono=1`).    |

After saving, click **Restart**. The values are URL-encoded and injected
into the request when you open `/` — exactly the same params documented in
`test-url.local`.

## Where does the configuration live?

HA Supervisor writes the saved options to `/data/options.json` inside the
container. `run.sh` reads that file with `jq` at startup, builds a query
string, and patches a redirect into `nginx.conf` so visiting the add-on
root sends the browser to `/?<params>`.

You can still type a fresh URL into the address bar (or open Settings →
Save inside the app) at any time — the addon options are only the
*default* the app loads with.

## Updating

Pulling a new version of the add-on pulls a new Docker image from GHCR
(published by `.github/workflows/build.yaml` on every push to `main` and
on `v*` tags). Your saved options carry over — they live in `/data`,
which HA persists across restarts and upgrades.

## Troubleshooting

- **Blank page / 404 on assets**: usually means nginx's `sub_filter` did
  not rewrite a path. Check the add-on log (Logs tab) for nginx warnings.
  The most common cause is a response coming back gzipped, which would
  bypass `sub_filter`; the proxy already forces `Accept-Encoding: ""` so
  this should not happen, but Next.js middleware changes can re-introduce
  it.
- **"Next.js exited before becoming ready"** in the log: the build failed
  or `next start` couldn't bind. Re-pull the image and check the GHCR
  publish ran successfully.
- **No sidebar entry**: confirm `Show in sidebar` is enabled in the
  add-on **Info** tab.
